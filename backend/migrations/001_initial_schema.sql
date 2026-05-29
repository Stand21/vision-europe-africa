-- ============================================================
-- Vision Europe Africa — PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Applications Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name         VARCHAR(150)  NOT NULL,
  email             VARCHAR(255)  NOT NULL,
  phone             VARCHAR(30)   NOT NULL,
  whatsapp          VARCHAR(30),
  profile           VARCHAR(20)   NOT NULL CHECK (profile IN ('student', 'worker', 'visitor')),
  destination       VARCHAR(30)   NOT NULL CHECK (destination IN ('germany', 'portugal', 'multiple')),

  -- Student fields
  education_level   VARCHAR(100),
  target_degree     VARCHAR(50),
  field             VARCHAR(100),
  country           VARCHAR(100),
  city              VARCHAR(100),
  motivation_letter TEXT,

  -- Worker fields
  profession        VARCHAR(100),
  experience        SMALLINT,
  work_hours        VARCHAR(50),
  expected_salary   VARCHAR(50),

  -- Visitor fields
  category          VARCHAR(50),
  purpose           TEXT,
  duration          VARCHAR(50),

  -- Common
  budget            VARCHAR(50),
  id_number         VARCHAR(100),
  signature         TEXT,
  documents         JSONB         DEFAULT '[]',
  admin_notes       TEXT,
  status            VARCHAR(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_profile    ON applications (profile);
CREATE INDEX IF NOT EXISTS idx_applications_destination ON applications (destination);
CREATE INDEX IF NOT EXISTS idx_applications_email      ON applications (email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);

-- ── Admin Users Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'superadmin', 'viewer')),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Default admin (password: Admin@2025 — CHANGE IN PRODUCTION)
INSERT INTO admin_users (name, email, password_hash, role)
VALUES (
  'Super Admin',
  'admin@visioneuropeafrica.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Ley.b7J8XC5qzqXxG', -- bcrypt of 'Admin@2025'
  'superadmin'
) ON CONFLICT (email) DO NOTHING;

-- ── Activity Logs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id          BIGSERIAL    PRIMARY KEY,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50),
  entity_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action  ON activity_logs (action);

-- ── Settings Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT,
  description TEXT,
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('telegram_bot_token', '', 'Telegram Bot API Token'),
  ('telegram_chat_id',   '', 'Telegram Admin Group Chat ID'),
  ('notification_email', 'admin@visioneuropeafrica.com', 'Email for notifications'),
  ('site_name',          'Vision Europe Africa', 'Platform name'),
  ('response_time_hours', '48', 'Promised response time in hours')
ON CONFLICT (key) DO NOTHING;

-- ── Updated_at Trigger ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
