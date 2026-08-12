CREATE TABLE IF NOT EXISTS scholarships (
  id BIGSERIAL PRIMARY KEY,
  fingerprint TEXT UNIQUE NOT NULL,

  title TEXT NOT NULL,
  provider TEXT,
  university TEXT,

  country TEXT,
  country_code VARCHAR(10),
  city TEXT,

  levels TEXT[] NOT NULL DEFAULT '{}',
  fields TEXT[] NOT NULL DEFAULT '{}',

  funding_type VARCHAR(30),

  amount NUMERIC,
  currency VARCHAR(10),

  tuition_covered BOOLEAN NOT NULL DEFAULT false,
  accommodation_covered BOOLEAN NOT NULL DEFAULT false,
  travel_covered BOOLEAN NOT NULL DEFAULT false,
  stipend_covered BOOLEAN NOT NULL DEFAULT false,

  description TEXT,

  deadline TIMESTAMPTZ,

  application_url TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,

  image_url TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'unknown')),

  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_country
  ON scholarships(country_code);

CREATE INDEX IF NOT EXISTS idx_scholarships_status
  ON scholarships(status);

CREATE INDEX IF NOT EXISTS idx_scholarships_deadline
  ON scholarships(deadline);

CREATE INDEX IF NOT EXISTS idx_scholarships_source
  ON scholarships(source_name);
