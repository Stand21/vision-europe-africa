# Test complet, commit et déploiement — branche `feat/bourses-whatsapp`

J'ai monté la pile entière de mon côté — PostgreSQL réel, backend, frontend
compilé, plus une fausse API de bourses — et tout testé. **Trois bugs réels
sont sortis, qu'aucune compilation n'aurait révélés.** Détail plus bas.

---

## 1. Commit et push

```bash
cd ~/projets/vision-europe-africa

# Ma tentative de commit a laissé un verrou que je n'ai pas le droit de supprimer
rm -f .git/index.lock

git add -A
git commit -F - <<'MSG'
feat(bourses): section bourses d'études avec contact WhatsApp

Ajoute une section Bourses sur l'accueil et une page /bourses dédiée,
alimentées par l'API Ma Bourse d'Études via un relais backend.

Backend
- scholarshipService : relais vers l'API, cache 5 min, filtres sur liste
  blanche, liste vide si l'API est injoignable plutôt qu'une erreur
- routes publiques /scholarships, /scholarships/countries et /settings
- routes admin GET/PATCH /settings
- migration 013 : réglages whatsapp_number et whatsapp_message

Frontend
- useScholarships + usePublicSettings + whatsappLink
- cartes : visuel, compte à rebours coloré selon l'urgence, pays,
  bouton Postuler et bouton WhatsApp avec message pré-rempli
- page /bourses avec recherche, filtres pays et niveau
- panneau Contact WhatsApp dans l'admin, avec aperçu du lien
- 25 nouvelles clés dans les 4 langues

Corrections trouvées en testant sur une base réelle
- salary_min/salary_max n'étaient pas exposés par l'API destinations
- migration 011 : le métier « Software Engineer » du seed d'origine
  restait en anglais côté français
- migration 001 : l'empreinte du mot de passe admin ne correspondait à
  aucun mot de passe ; migration 014 répare les installations existantes

Déploiement
- SCHOLARSHIP_API_URL dans render.yaml, .env.example et start-local.sh
MSG

git push -u origin feat/bourses-whatsapp
```

---

## 2. Voir le site en local

Je ne peux pas t'envoyer de lien : mes commandes tournent dans un environnement
isolé de ta machine. Un `localhost` de mon côté ne serait joignable que par moi.
En revanche tout est prêt pour tourner chez toi.

**Sans les bourses** (le reste du site fonctionne normalement) :

```bash
cd ~/projets/vision-europe-africa && ./start-local.sh
```

**Avec les bourses** — lance d'abord ton API dans un autre terminal :

```bash
cd ~/Downloads/ma-bourse-scholarship-api
npm install && docker compose up -d && npm run dev     # port 8080
```

puis :

```bash
cd ~/projets/vision-europe-africa
SCHOLARSHIP_API_URL=http://localhost:8080 ./start-local.sh
```

Le script affiche les adresses à la fin. Ensuite :

1. **Admin → Réglages → Contact WhatsApp** : saisis ton numéro au format
   international sans `+` ni espaces (`224620000000` pour la Guinée).
   Le bouton WhatsApp n'apparaît qu'une fois le numéro renseigné.
2. Page d'accueil : la section **Bourses** est entre Destinations et
   « Comment ça marche ».
3. Menu **Bourses** : la page complète avec recherche et filtres.

Identifiants admin : `admin@visioneuropeafrica.com` / `Admin@2025`
— ils fonctionnent enfin, voir le bug n° 3.

---

## 3. Déployer sur Render

Une seule variable à ajouter par rapport à ta configuration actuelle :

| Service | Variable | Valeur |
|---------|----------|--------|
| `vea-backend` | `SCHOLARSHIP_API_URL` | l'URL publique de ton API bourses, sans `/` final |

**Si les services existent déjà** : tableau de bord Render → `vea-backend` →
*Environment* → ajoute la variable → déclenche un déploiement manuel sur la
branche `feat/bourses-whatsapp` pour la tester avant de fusionner dans `main`.

**Sinon** : *New* → *Blueprint*, connecte le dépôt, Render lit `render.yaml`.
Il demandera `DATABASE_URL` (ta base Neon), `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `DASHBOARD_URL` et `SCHOLARSHIP_API_URL`.

Ton API bourses doit elle aussi être déployée quelque part de joignable : son
`docker-compose.yml` ne sert qu'au développement local.

Au premier démarrage, les logs Render doivent montrer les **14 migrations**,
dont `013_scholarships_settings` et `014_fix_admin_password`.

---

## Les trois bugs trouvés en testant pour de vrai

**1. Fourchettes de salaire absentes de l'API**
J'avais ajouté `salary_min` et `salary_max` en base (migration 012) sans les
exposer dans le contrôleur. Le panneau détail d'une destination serait retombé
silencieusement sur le salaire moyen, sans fourchette.

**2. Métier resté en anglais sur le site francophone**
Le seed d'origine stockait « Software Engineer » dans la colonne `role`. Ma
migration reprenait cette valeur comme version française et la laissait primer
sur ma traduction. Corrigé, en ne remplaçant que cette valeur héritée précise —
une saisie faite depuis l'admin n'est jamais écrasée.

**3. Le mot de passe administrateur ne fonctionnait pas**
L'empreinte livrée dans la migration 001 ne correspondait à aucun mot de passe :
ni `Admin@2025`, ni aucune variante courante. La connexion à `/admin` était donc
impossible sur une installation neuve, malgré ce qu'annonce le README. La
migration 014 répare les bases existantes, sans toucher à un mot de passe déjà
changé.

---

## Ce qui a été vérifié, et comment

Sur un **PostgreSQL réel** (pas une simulation), avec les 14 migrations
appliquées et une fausse API de bourses renvoyant 4 bourses dont une à 5 jours
de l'échéance :

| Domaine | Vérifications |
|---|---|
| Destinations | 8 servies, noms et programmes traduits dans les 4 langues, aucun champ interne exposé, fourchettes de salaire, critères de filtrage |
| Témoignages | 6 servis, métier / ville / texte traduits, replis partiels corrects |
| Taux de change | base EUR, 39 devises dont GNF, XOF, XAF, CDF, NGN, MAD ; conversions justes |
| Bourses | relais, compte à rebours, normalisation des champs, filtres pays / niveau / recherche, injection de paramètre bloquée, cache |
| WhatsApp | enregistrement admin → lecture publique → lien complet ; vidé, le bouton disparaît |
| Candidatures | destination inexistante refusée, destination ouverte acceptée |
| Pages rendues | `/`, `/bourses`, `/apply`, `/admin` servies ; sections présentes, aucun résidu anglais |
| Traductions | audit à zéro sur 13 fichiers ; 276 clés strictement identiques en fr / en / pt / de |

Une note sur `/apply` : la page ne rend rien côté serveur (son contenu dépend
des paramètres d'URL, sous `Suspense`). C'est normal pour un formulaire, mais
elle est donc invisible des moteurs de recherche.
