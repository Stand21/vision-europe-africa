-- ============================================================
-- Vision Europe Africa — Champs filtrables des destinations
-- Alimente la barre de filtres de la page d'accueil :
-- profil accepté, budget, langue, délai de visa, salaire.
-- ============================================================

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS languages       JSONB   NOT NULL DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS profiles        JSONB   NOT NULL DEFAULT '["student","worker","visitor"]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS avg_salary      INT;      -- € brut / an
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cost_level      VARCHAR(10);  -- low | medium | high
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS visa_weeks_min  INT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS visa_weeks_max  INT;

ALTER TABLE destinations DROP CONSTRAINT IF EXISTS destinations_cost_level_check;
ALTER TABLE destinations ADD  CONSTRAINT destinations_cost_level_check
  CHECK (cost_level IS NULL OR cost_level IN ('low', 'medium', 'high'));

-- La vue doit exposer les nouvelles colonnes
DROP VIEW IF EXISTS destinations_public;
CREATE VIEW destinations_public AS
  SELECT *
    FROM destinations
   WHERE is_active = true
     AND (available_from  IS NULL OR available_from  <= CURRENT_DATE)
     AND (available_until IS NULL OR available_until >= CURRENT_DATE);

-- ── Renseignement des 8 pays du seed ──────────────────────────────────────────
-- Ne touche que les lignes encore vides : les modifications faites depuis
-- l'admin ne sont jamais écrasées.
UPDATE destinations SET
  languages      = COALESCE(NULLIF(languages, '[]'::jsonb), d.langs),
  avg_salary     = COALESCE(avg_salary,     d.salary),
  cost_level     = COALESCE(cost_level,     d.cost),
  visa_weeks_min = COALESCE(visa_weeks_min, d.wmin),
  visa_weeks_max = COALESCE(visa_weeks_max, d.wmax)
FROM (VALUES
  ('germany',     '["Allemand","Anglais"]'::jsonb,   45000, 'high',    8, 12),
  ('portugal',    '["Portugais","Anglais"]'::jsonb,  22000, 'low',     6, 10),
  ('france',      '["Français"]'::jsonb,             38000, 'medium',  6, 10),
  ('belgium',     '["Français","Néerlandais"]'::jsonb, 42000, 'medium', 8, 12),
  ('spain',       '["Espagnol","Anglais"]'::jsonb,   28000, 'low',     6, 12),
  ('italy',       '["Italien","Anglais"]'::jsonb,    30000, 'medium',  8, 16),
  ('netherlands', '["Néerlandais","Anglais"]'::jsonb, 48000, 'high',   4,  8),
  ('poland',      '["Polonais","Anglais"]'::jsonb,   24000, 'low',     4,  8)
) AS d(code, langs, salary, cost, wmin, wmax)
WHERE destinations.code = d.code;

-- La Pologne et les Pays-Bas n'ouvrent pas de dossier visiteur via la plateforme
UPDATE destinations SET profiles = '["student","worker"]'
 WHERE code IN ('poland', 'netherlands') AND profiles = '["student","worker","visitor"]';
