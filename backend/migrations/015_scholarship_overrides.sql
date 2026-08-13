-- ============================================================
-- Vision Europe Africa — Personnalisation des bourses
--
-- Les bourses viennent d'une API externe : on ne peut pas y écrire. Cette
-- table stocke ce que l'administrateur ajoute par-dessus — principalement le
-- visuel de la carte, comme les affiches de Ma Bourse d'Études.
--
-- La clé est la référence de la bourse telle que servie par l'API (`id`).
-- Une bourse qui disparaît de l'API laisse simplement une ligne orpheline,
-- sans conséquence.
-- ============================================================

CREATE TABLE IF NOT EXISTS scholarship_overrides (
  scholarship_ref VARCHAR(120) PRIMARY KEY,
  -- Titre conservé à titre indicatif : permet de reconnaître la ligne en base
  -- même si l'API change, et d'afficher quelque chose de lisible dans l'admin.
  title_snapshot  TEXT,
  image_url       TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_hidden       BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarship_overrides_featured
  ON scholarship_overrides (is_featured, sort_order);

DROP TRIGGER IF EXISTS scholarship_overrides_updated_at ON scholarship_overrides;
CREATE TRIGGER scholarship_overrides_updated_at
  BEFORE UPDATE ON scholarship_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
