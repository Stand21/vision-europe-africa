-- ============================================================
-- Vision Europe Africa — Currencies management
-- ============================================================

CREATE TABLE IF NOT EXISTS currencies (
  code        VARCHAR(10)  PRIMARY KEY,
  symbol      VARCHAR(10)  NOT NULL,
  label       VARCHAR(60)  NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO currencies (code, symbol, label, sort_order) VALUES
  ('EUR', '€',   'Euro',                      1),
  ('USD', '$',   'US Dollar',                 2),
  ('GBP', '£',   'British Pound',             3),
  ('CHF', 'Fr',  'Swiss Franc',               4),
  ('XOF', 'CFA', 'West African CFA (BCEAO)',  5),
  ('XAF', 'CFA', 'Central African CFA (BEAC)',6),
  ('GNF', 'GFr', 'Guinean Franc',             7),
  ('NGN', '₦',   'Nigerian Naira',            8),
  ('GHS', '₵',   'Ghanaian Cedi',             9),
  ('KES', 'KSh', 'Kenyan Shilling',           10),
  ('TZS', 'TSh', 'Tanzanian Shilling',        11),
  ('UGX', 'USh', 'Ugandan Shilling',          12),
  ('ZAR', 'R',   'South African Rand',        13),
  ('CDF', 'FC',  'Congolese Franc',           14),
  ('MAD', 'DH',  'Moroccan Dirham',           15),
  ('DZD', 'DA',  'Algerian Dinar',            16),
  ('EGP', 'E£',  'Egyptian Pound',            17)
ON CONFLICT (code) DO NOTHING;
