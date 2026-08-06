-- ============================================================
-- Vision Europe Africa — Add currency column to applications
-- ============================================================

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'EUR';

-- Existing budget rows stay EUR by default; new applications
-- will carry the currency selected by the applicant.
