-- ============================================================
-- Vision Europe Africa — Destinations management
-- Destinations are now stored in DB, managed from the admin panel,
-- and can be limited to a validity period (available_from / available_until).
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(30)   NOT NULL UNIQUE,   -- slug used in forms/URLs, e.g. 'germany'
  country_code    VARCHAR(5)    NOT NULL,          -- ISO-2, e.g. 'DE'
  name            VARCHAR(100)  NOT NULL,
  flag            VARCHAR(10),
  tagline         VARCHAR(160),
  description     TEXT,
  highlights      JSONB         NOT NULL DEFAULT '[]',
  programs        JSONB         NOT NULL DEFAULT '[]',
  image_url       TEXT,
  accent_color    VARCHAR(20)   DEFAULT '#635bff',
  is_featured     BOOLEAN       NOT NULL DEFAULT false,

  -- Validity window. NULL = no limit on that side.
  available_from  DATE,
  available_until DATE,

  is_active       BOOLEAN       NOT NULL DEFAULT true,
  sort_order      INT           NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_destinations_window ON destinations (available_from, available_until);

-- A destination is publicly visible only if active AND inside its validity window.
CREATE OR REPLACE VIEW destinations_public AS
  SELECT *
    FROM destinations
   WHERE is_active = true
     AND (available_from  IS NULL OR available_from  <= CURRENT_DATE)
     AND (available_until IS NULL OR available_until >= CURRENT_DATE);

-- ── Seed ───────────────────────────────────────────────────────────────────────
-- Deterministic UUIDs keep the seed idempotent across deploys/restarts.
INSERT INTO destinations
  (id, code, country_code, name, flag, tagline, description, highlights, programs, image_url, accent_color, is_featured, sort_order)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'germany', 'DE', 'Allemagne', '🇩🇪',
   'Excellence & Opportunité',
   'Première économie européenne, l''Allemagne recrute massivement dans la tech, la santé et l''ingénierie. Universités publiques quasi gratuites et Opportunity Card pour chercher un emploi sur place.',
   '["Salaire moyen 45 000 €/an","Universités publiques gratuites","Opportunity Card","Marché de l''emploi solide"]',
   '["Visa Travail","Visa Étudiant","Opportunity Card","Carte Bleue Européenne"]',
   '/images/germany.jpg', '#635bff', true, 1),

  ('20000000-0000-4000-8000-000000000002', 'portugal', 'PT', 'Portugal', '🇵🇹',
   'Votre première porte vers l''Europe',
   'Le point d''entrée le plus accessible de l''espace Schengen : visa D7, procédures souples et un chemin clair vers la citoyenneté européenne en 5 ans.',
   '["Coût de la vie abordable","Visa D7","Accueil des étudiants","Voie vers la citoyenneté UE"]',
   '["Visa D7","Visa Étudiant","Visa Recherche d''Emploi","Startup Visa"]',
   '/images/portugal.jpg', '#00a36c', true, 2),

  ('20000000-0000-4000-8000-000000000003', 'france', 'FR', 'France', '🇫🇷',
   'La destination francophone',
   'Aucune barrière linguistique pour les candidats francophones. Frais universitaires réduits et le Passeport Talent pour les profils qualifiés.',
   '["Enseignement en français","Frais universitaires réduits","Passeport Talent","Forte diaspora africaine"]',
   '["Visa Étudiant","Passeport Talent","Visa Salarié","Visa Visiteur"]',
   NULL, '#0055a4', false, 3),

  ('20000000-0000-4000-8000-000000000004', 'belgium', 'BE', 'Belgique', '🇧🇪',
   'Le cœur de l''Europe',
   'Siège des institutions européennes, marché du travail bilingue et universités reconnues à Bruxelles, Liège et Louvain.',
   '["Bruxelles, capitale de l''UE","Études en français","Carte Bleue Européenne","Qualité de vie élevée"]',
   '["Visa Étudiant","Carte Bleue Européenne","Permis Unique","Visa Regroupement"]',
   NULL, '#fdda24', false, 4),

  ('20000000-0000-4000-8000-000000000005', 'spain', 'ES', 'Espagne', '🇪🇸',
   'Soleil, études et opportunités',
   'Coût de la vie modéré, visa nomade digital et forte demande de main-d''œuvre dans le tourisme, l''agriculture et la santé.',
   '["Coût de la vie modéré","Visa nomade digital","Régularisation par arraigo","Climat agréable"]',
   '["Visa Étudiant","Visa Nomade Digital","Visa Travail","Visa Non-Lucratif"]',
   NULL, '#c60b1e', false, 5),

  ('20000000-0000-4000-8000-000000000006', 'italy', 'IT', 'Italie', '🇮🇹',
   'Patrimoine et savoir-faire',
   'Le décret flux (Decreto Flussi) ouvre chaque année des quotas de permis de travail, notamment dans la logistique, la santé et l''agroalimentaire.',
   '["Decreto Flussi annuel","Bourses DSU pour étudiants","Secteur santé en tension","Universités historiques"]',
   '["Visa Étudiant","Decreto Flussi","Carte Bleue Européenne","Visa Indépendant"]',
   NULL, '#008c45', false, 6),

  ('20000000-0000-4000-8000-000000000007', 'netherlands', 'NL', 'Pays-Bas', '🇳🇱',
   'Innovation et anglais partout',
   'Plus de 2 000 programmes enseignés en anglais et un visa « année d''orientation » pour rester chercher un emploi après le diplôme.',
   '["Programmes en anglais","Visa Orientation Year","Salaires élevés","Hub tech européen"]',
   '["Visa Étudiant","Orientation Year","Highly Skilled Migrant","Carte Bleue Européenne"]',
   NULL, '#ff6b1a', false, 7),

  ('20000000-0000-4000-8000-000000000008', 'poland', 'PL', 'Pologne', '🇵🇱',
   'L''Europe accessible',
   'Frais de scolarité et coût de la vie parmi les plus bas de l''UE, avec des procédures de visa réputées rapides pour les étudiants africains.',
   '["Frais de scolarité bas","Procédures rapides","Économie en croissance","Porte d''entrée Schengen"]',
   '["Visa Étudiant","Permis de Travail Type A","Carte Bleue Européenne","Visa Business"]',
   NULL, '#dc143c', false, 8)
ON CONFLICT (code) DO NOTHING;

-- ── Applications: destination is now free-form (validated against the table) ───
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_destination_check;
ALTER TABLE applications ALTER COLUMN destination TYPE VARCHAR(60);

-- ── updated_at trigger ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS destinations_updated_at ON destinations;
CREATE TRIGGER destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
