-- ============================================================
-- Vision Europe Africa — add updated_at to testimonials
-- ============================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
