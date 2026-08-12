#!/usr/bin/env bash
# ============================================================================
# Vision Europe Africa — démarrage local en une commande
#
#   ./start-local.sh
#
# Le script : détecte/lance PostgreSQL, crée les fichiers .env, installe les
# dépendances, applique les migrations, puis démarre le backend et le frontend.
# Ctrl+C arrête proprement les deux serveurs.
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

DB_NAME="vision_europe_africa"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT="5432"
PG_CONTAINER="vea_postgres"

# --docker : ignorer un PostgreSQL local et forcer le conteneur
# --reset-env : régénérer backend/.env même s'il existe déjà
FORCE_DOCKER=0
RESET_ENV=0
for arg in "$@"; do
  case "$arg" in
    --docker)    FORCE_DOCKER=1 ;;
    --reset-env) RESET_ENV=1 ;;
    -h|--help)
      echo "Usage: ./start-local.sh [--docker] [--reset-env]"
      exit 0 ;;
  esac
done

blue()  { printf "\033[1;34m%s\033[0m\n" "$1"; }
green() { printf "\033[1;32m%s\033[0m\n" "$1"; }
red()   { printf "\033[1;31m%s\033[0m\n" "$1"; }
dim()   { printf "\033[2m%s\033[0m\n" "$1"; }

# ── 0. Ports ─────────────────────────────────────────────────────────────────
# macOS occupe souvent le 5000 (récepteur AirPlay) et le 3000 peut servir à un
# autre projet : on prend le premier port libre à partir de la valeur souhaitée.
port_is_free() {
  if command -v lsof >/dev/null 2>&1; then
    ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  elif command -v nc >/dev/null 2>&1; then
    ! nc -z localhost "$1" >/dev/null 2>&1
  else
    return 0
  fi
}

port_owner() {
  command -v lsof >/dev/null 2>&1 || { echo "un autre processus"; return; }
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -F c 2>/dev/null | grep '^c' | head -1 | cut -c2- || echo "un autre processus"
}

find_free_port() {
  local port="$1" limit=$((${1} + 20))
  while [ "$port" -lt "$limit" ]; do
    if port_is_free "$port"; then echo "$port"; return 0; fi
    port=$((port + 1))
  done
  red "Aucun port libre entre $1 et $limit." >&2
  exit 1
}

# ── 1. Prérequis ─────────────────────────────────────────────────────────────
blue "▸ Vérification des prérequis"

if ! command -v node >/dev/null 2>&1; then
  red "Node.js est introuvable."
  echo "  Installez-le : https://nodejs.org  (ou : brew install node)"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  red "Node.js 18+ requis (version détectée : $(node -v))."
  exit 1
fi
dim "  Node $(node -v) · npm $(npm -v)"

BACKEND_PORT="$(find_free_port 5000)"
FRONTEND_PORT="$(find_free_port 3000)"

if [ "$BACKEND_PORT" != "5000" ]; then
  dim "  Port 5000 occupé par « $(port_owner 5000) » → backend sur $BACKEND_PORT"
fi
if [ "$FRONTEND_PORT" != "3000" ]; then
  dim "  Port 3000 occupé par « $(port_owner 3000) » → frontend sur $FRONTEND_PORT"
fi

# ── 2. Base de données ───────────────────────────────────────────────────────
blue "▸ Base de données PostgreSQL"

start_postgres_docker() {
  if docker ps -a --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
    docker start "$PG_CONTAINER" >/dev/null
    dim "  Conteneur $PG_CONTAINER redémarré"
  else
    docker run -d \
      --name "$PG_CONTAINER" \
      -e POSTGRES_PASSWORD="$DB_PASSWORD" \
      -e POSTGRES_USER="$DB_USER" \
      -e POSTGRES_DB="$DB_NAME" \
      -p "${DB_PORT}:5432" \
      -v vea_pgdata:/var/lib/postgresql/data \
      postgres:16-alpine >/dev/null
    dim "  Conteneur $PG_CONTAINER créé"
  fi

  printf "  En attente de PostgreSQL"
  for _ in $(seq 1 40); do
    if docker exec "$PG_CONTAINER" pg_isready -U "$DB_USER" >/dev/null 2>&1; then
      echo ""
      green "  ✔ PostgreSQL prêt (Docker, port $DB_PORT)"
      return 0
    fi
    printf "."
    sleep 1
  done
  echo ""
  red "PostgreSQL n'a pas démarré à temps."
  exit 1
}

# Cherche un rôle qui accepte vraiment une connexion. Sous Homebrew le
# superutilisateur est le nom macOS ; sous Postgres.app c'est souvent 'postgres'.
detect_local_role() {
  local candidate
  for candidate in "${USER:-}" postgres; do
    [ -z "$candidate" ] && continue
    if psql -h localhost -p "$DB_PORT" -U "$candidate" -d postgres -tAc 'SELECT 1' >/dev/null 2>&1; then
      DB_USER="$candidate"
      DB_PASSWORD=""   # authentification 'trust' locale
      return 0
    fi
  done
  return 1
}

use_local_postgres() {
  if ! detect_local_role; then
    red "  PostgreSQL répond sur le port $DB_PORT, mais aucun rôle utilisable."
    echo ""
    echo "  Testé sans succès : « ${USER:-inconnu} » et « postgres »."
    echo ""
    echo "  Deux solutions :"
    echo "    1) Créer le rôle manquant :   createuser -s postgres"
    echo "    2) Passer par Docker :        ./start-local.sh --docker"
    echo ""
    exit 1
  fi
  dim "  Rôle utilisé : $DB_USER"

  # Crée la base si besoin — en affichant l'erreur au lieu de l'avaler
  if psql -h localhost -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc \
       "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1; then
    dim "  Base « $DB_NAME » déjà présente"
  else
    if createdb -h localhost -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/tmp/vea_createdb.err; then
      dim "  Base « $DB_NAME » créée"
    else
      red "  Création de la base impossible :"
      sed 's/^/    /' /tmp/vea_createdb.err
      echo ""
      echo "  Contournement :  ./start-local.sh --docker"
      exit 1
    fi
  fi

  # Les extensions de 001 exigent les droits superutilisateur
  if ! psql -h localhost -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"' >/dev/null 2>/tmp/vea_ext.err; then
    red "  Extension uuid-ossp indisponible :"
    sed 's/^/    /' /tmp/vea_ext.err
    echo ""
    echo "  Le rôle « $DB_USER » n'est probablement pas superutilisateur."
    echo "  Contournement :  ./start-local.sh --docker"
    exit 1
  fi

  green "  ✔ PostgreSQL local prêt (port $DB_PORT, base $DB_NAME)"
}

if [ "$FORCE_DOCKER" = "1" ]; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    start_postgres_docker
  else
    red "Docker demandé (--docker) mais indisponible — lancez Docker Desktop."
    exit 1
  fi
elif command -v psql >/dev/null 2>&1 && pg_isready -h localhost -p "$DB_PORT" >/dev/null 2>&1; then
  use_local_postgres
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  start_postgres_docker
else
  red "Aucun PostgreSQL disponible."
  echo ""
  echo "  Choisissez une option puis relancez ce script :"
  echo ""
  echo "  A) Docker Desktop  → https://www.docker.com/products/docker-desktop"
  echo "     (démarrez Docker, le script créera la base tout seul)"
  echo ""
  echo "  B) PostgreSQL natif → brew install postgresql@16"
  echo "                        brew services start postgresql@16"
  echo "                        createuser -s postgres"
  echo ""
  exit 1
fi

# ── 3. Fichiers .env ─────────────────────────────────────────────────────────
blue "▸ Configuration"

ENV_MARKER="# généré par start-local.sh — supprimez cette ligne pour figer vos réglages"

# On régénère tant que le fichier porte le marqueur : les identifiants de base
# ne sont connus qu'après la détection ci-dessus.
if [ ! -f backend/.env ] || [ "$RESET_ENV" = "1" ] || grep -q "^$ENV_MARKER$" backend/.env 2>/dev/null; then
  cat > backend/.env <<ENV
$ENV_MARKER
NODE_ENV=development
PORT=$BACKEND_PORT

DB_HOST=localhost
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false

JWT_SECRET=dev_local_secret_change_me_0123456789abcdef
JWT_EXPIRES=24h

DASHBOARD_URL=http://localhost:$FRONTEND_PORT
ALLOWED_ORIGINS=http://localhost:$FRONTEND_PORT

LOG_LEVEL=info
ENV
  dim "  backend/.env écrit (base : $DB_USER@localhost:$DB_PORT/$DB_NAME · API sur $BACKEND_PORT)"
else
  dim "  backend/.env personnalisé — conservé tel quel"
fi

if [ ! -f frontend/.env.local ] || [ "$RESET_ENV" = "1" ] || grep -q "^$ENV_MARKER$" frontend/.env.local 2>/dev/null; then
  cat > frontend/.env.local <<ENV
$ENV_MARKER
NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT/api
NEXT_PUBLIC_APP_NAME=Vision Europe Africa
ENV
  dim "  frontend/.env.local écrit (API → http://localhost:$BACKEND_PORT/api)"
else
  dim "  frontend/.env.local personnalisé — conservé tel quel"
fi

# ── 4. Dépendances ───────────────────────────────────────────────────────────
blue "▸ Dépendances"

if [ ! -d backend/node_modules ]; then
  dim "  Installation backend…"
  (cd backend && npm install --no-audit --no-fund)
else
  dim "  backend/node_modules déjà installé"
fi

if [ ! -d frontend/node_modules ]; then
  dim "  Installation frontend…"
  (cd frontend && npm install --no-audit --no-fund)
else
  dim "  frontend/node_modules déjà installé"
fi

# ── 5. Migrations ────────────────────────────────────────────────────────────
blue "▸ Migrations (dont 008_add_destinations)"
(cd backend && npm run migrate --silent) || {
  red "Les migrations ont échoué — vérifiez la connexion PostgreSQL."
  exit 1
}
green "  ✔ Schéma à jour"

# ── 6. Démarrage ─────────────────────────────────────────────────────────────
blue "▸ Démarrage des serveurs"

mkdir -p .local-logs
PIDS=()

cleanup_quiet() {
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}

cleanup() {
  echo ""
  blue "▸ Arrêt des serveurs…"
  cleanup_quiet
  wait 2>/dev/null || true
  green "  ✔ Arrêté."
  exit 0
}
trap cleanup INT TERM

# Échoue tout de suite si un serveur meurt, au lieu d'attendre 30s pour rien.
wait_for() {
  local label="$1" url="$2" pid="$3" logfile="$4" tries="$5"
  printf "  %s" "$label"
  for _ in $(seq 1 "$tries"); do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo ""
      red "  ✖ $label s'est arrêté. Dernières lignes de $logfile :"
      echo ""
      tail -20 "$logfile" | sed 's/^/    /'
      echo ""
      cleanup_quiet
      exit 1
    fi
    if curl -sf "$url" >/dev/null 2>&1; then
      echo ""
      green "  ✔ $label sur ${url%/health}"
      return 0
    fi
    printf "."
    sleep 1
  done
  echo ""
  red "  ✖ $label n'a pas répondu à temps — voir $logfile"
  cleanup_quiet
  exit 1
}

(cd backend && node src/index.js > "$ROOT/.local-logs/backend.log" 2>&1) &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
wait_for "Backend" "http://localhost:$BACKEND_PORT/health" "$BACKEND_PID" ".local-logs/backend.log" 30

(cd frontend && npx next dev --port "$FRONTEND_PORT" > "$ROOT/.local-logs/frontend.log" 2>&1) &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)
wait_for "Frontend" "http://localhost:$FRONTEND_PORT" "$FRONTEND_PID" ".local-logs/frontend.log" 90
echo ""

printf "\033[1;32m%s\033[0m\n" "╭──────────────────────────────────────────────────────────╮"
green "  Vision Europe Africa tourne en local"
echo ""
echo "   Site      →  http://localhost:$FRONTEND_PORT"
echo "   Admin     →  http://localhost:$FRONTEND_PORT/admin"
echo "   API       →  http://localhost:$BACKEND_PORT/api/destinations"
echo ""
echo "   Login admin : admin@visioneuropeafrica.com / Admin@2025"
printf "\033[1;32m%s\033[0m\n" "╰──────────────────────────────────────────────────────────╯"
echo ""
dim "Logs : .local-logs/backend.log · .local-logs/frontend.log"
dim "Ctrl+C pour tout arrêter."
echo ""

command -v open >/dev/null 2>&1 && open "http://localhost:$FRONTEND_PORT" || true

wait
