-- ============================================================
-- Vision Europe Africa — Destinations (Countries)
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(4)   NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  flag        VARCHAR(10),
  tagline     VARCHAR(200),
  description TEXT,
  highlights  JSONB        NOT NULL DEFAULT '[]'::jsonb,
  programs    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  stat_label  VARCHAR(50),
  stat_sub    VARCHAR(100),
  image       TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations (is_active, sort_order);

-- Seed with the destinations currently shown on the landing page.
-- Deterministic UUIDs keep the seed idempotent across server restarts.
INSERT INTO destinations (id, code, name, flag, tagline, description, highlights, programs, stat_label, stat_sub, sort_order) VALUES
  ('20000000-0000-4000-8000-000000000001', 'DE', 'Germany', '🇩🇪',
   'Excellence & Opportunity',
   'Europe''s economic powerhouse offers world-class universities, high salaries, and an exceptional quality of life. The Opportunity Card makes it easier than ever to relocate.',
   '["Avg. salary €45,000/yr", "Free/low-cost universities", "Opportunity Card", "Strong job market"]',
   '["Work Visa", "Student Visa", "Opportunity Card", "EU Blue Card"]',
   '€45,000', 'Avg. salary/year', 1),
  ('20000000-0000-4000-8000-000000000002', 'PT', 'Portugal', '🇵🇹',
   'Your First Step Into Europe',
   'The most accessible gateway to the EU. Affordable living, welcoming culture, growing tech scene, and a clear path to EU citizenship.',
   '["Affordable cost of living", "D7 & Student visas", "Portuguese-friendly for Africans", "Path to EU citizenship"]',
   '["D7 Visa", "Student Visa", "Job Seeker Visa", "Startup Visa"]',
   'D7 Visa', 'Affordable entry', 2)
ON CONFLICT (code) DO NOTHING;