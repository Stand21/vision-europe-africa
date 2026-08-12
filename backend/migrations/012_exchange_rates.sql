-- ============================================================
-- Vision Europe Africa — Taux de change
--
-- Tous les montants du site sont stockés en euros. Cette table conserve le
-- dernier taux connu pour chaque devise, rafraîchi une fois par jour depuis
-- une API publique. Si l'API est injoignable, le site continue d'afficher
-- les derniers taux enregistrés — jamais de montant vide.
--
-- rate = combien d'unités de la devise pour 1 EUR.
-- ============================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  code        VARCHAR(10)   PRIMARY KEY,
  rate        NUMERIC(20,6) NOT NULL CHECK (rate > 0),
  source      VARCHAR(30)   NOT NULL DEFAULT 'seed',
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trace du dernier rafraîchissement réussi (une seule ligne)
INSERT INTO settings (key, value, description) VALUES
  ('rates_last_refresh', '', 'Horodatage du dernier rafraîchissement des taux de change'),
  ('rates_base', 'EUR', 'Devise de référence dans laquelle les montants sont stockés')
ON CONFLICT (key) DO NOTHING;

-- ── Taux de secours ───────────────────────────────────────────────────────────
-- Valeurs relevées à la création de la migration : elles servent uniquement de
-- filet au tout premier démarrage, avant le premier appel à l'API.
INSERT INTO exchange_rates (code, rate, source) VALUES
  ('EUR', 1,          'seed'),
  ('USD', 1.154805,   'seed'),
  ('GBP', 0.855132,   'seed'),
  ('CHF', 0.934861,   'seed'),
  ('XOF', 655.957,    'seed'),
  ('XAF', 655.957,    'seed'),
  ('CDF', 2646.791045,'seed'),
  ('NGN', 1573.531648,'seed'),
  ('GHS', 13.596339,  'seed'),
  ('KES', 149.936019, 'seed'),
  ('TZS', 3026.322109,'seed'),
  ('UGX', 4256.577845,'seed'),
  ('ZAR', 18.687297,  'seed'),
  ('GNF', 10143.418357,'seed'),
  ('MAD', 10.755912,  'seed'),
  ('DZD', 153.745421, 'seed'),
  ('EGP', 57.622218,  'seed'),
  ('RWF', 1699.456929,'seed'),
  ('ETB', 187.746558, 'seed'),
  ('ZMW', 21.772984,  'seed'),
  ('MZN', 73.852448,  'seed'),
  ('AOA', 1104.164506,'seed'),
  ('CVE', 110.265,    'seed'),
  ('GMD', 86.028358,  'seed'),
  ('LRD', 208.501606, 'seed'),
  ('SLE', 28.431394,  'seed'),
  ('MUR', 54.366776,  'seed'),
  ('MWK', 2013.987931,'seed'),
  ('BIF', 3455.392969,'seed'),
  ('SOS', 660.465549, 'seed'),
  ('SDG', 516.259098, 'seed'),
  ('TND', 3.376981,   'seed'),
  ('LYD', 7.345954,   'seed'),
  ('PLN', 4.300669,   'seed'),
  ('CZK', 24.251304,  'seed'),
  ('SEK', 10.961442,  'seed'),
  ('NOK', 10.968658,  'seed'),
  ('DKK', 7.463843,   'seed'),
  ('CAD', 1.609758,   'seed')
ON CONFLICT (code) DO NOTHING;

-- ── Montants des destinations ─────────────────────────────────────────────────
-- avg_salary est déjà un entier en euros (migration 009). On ajoute une borne
-- basse pour pouvoir afficher une fourchette plutôt qu'un chiffre unique.
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS salary_min INT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS salary_max INT;

UPDATE destinations
   SET salary_min = ROUND(avg_salary * 0.8),
       salary_max = ROUND(avg_salary * 1.35)
 WHERE avg_salary IS NOT NULL AND salary_min IS NULL;

DROP VIEW IF EXISTS destinations_public;
CREATE VIEW destinations_public AS
  SELECT *
    FROM destinations
   WHERE is_active = true
     AND (available_from  IS NULL OR available_from  <= CURRENT_DATE)
     AND (available_until IS NULL OR available_until >= CURRENT_DATE);
