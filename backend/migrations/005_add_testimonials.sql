-- ============================================================
-- Vision Europe Africa — Testimonials (photos & videos by URL)
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  country     VARCHAR(100),
  destination VARCHAR(100),
  role        VARCHAR(100),
  rating      SMALLINT     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text        TEXT,
  photo_url   TEXT,
  video_url   TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials (is_active, sort_order);

-- Seed with the testimonials currently shown on the landing page.
-- Deterministic UUIDs keep the seed idempotent across server restarts.
INSERT INTO testimonials (id, name, country, destination, role, rating, text, photo_url, video_url, sort_order) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Amara Diallo', 'Kinshasa, RD Congo', 'Berlin', 'Software Engineer', 5,
   'Vision Europe Africa a changé ma vie. L''équipe m''a guidé étape par étape pour le visa travail allemand. Je gagne maintenant €55,000/an à Berlin !',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=70', NULL, 1),
  ('10000000-0000-4000-8000-000000000002', 'Marie-Claire Nkosi', 'Cameroun', 'Lisbonne', 'Étudiante en Médecine', 5,
   'J''ai obtenu mon visa étudiant pour Lisbonne en 3 mois. L''équipe est très professionnelle et disponible. Je recommande fortement !',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=70', NULL, 2),
  ('10000000-0000-4000-8000-000000000003', 'Jean-Baptiste Kabila', 'Kinshasa, RD Congo', 'Hambourg', 'Logisticien', 5,
   'Professionnel, transparent et efficace. Ils ont géré tous mes documents et j''ai reçu mon permis de travail allemand plus vite que prévu.',
   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=70', NULL, 3),
  ('10000000-0000-4000-8000-000000000004', 'Fatou Sow', 'Sénégal', 'Porto', 'Étudiante en Commerce', 5,
   'Le processus était clair et sans surprise. Vision Europe Africa m''a accompagnée du premier contact jusqu''à mon arrivée à Porto.',
   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=70', NULL, 4),
  ('10000000-0000-4000-8000-000000000005', 'Christian Mbeki', 'Côte d''Ivoire', 'Munich', 'Spécialiste IT', 5,
   'J''étais sceptique, mais l''équipe s''est montrée extrêmement compétente. Mon dossier Opportunity Card a été accepté du premier coup !',
   'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&q=70', NULL, 5),
  ('10000000-0000-4000-8000-000000000006', 'Adaeze Okafor', 'Nigeria', 'Lisbonne', 'Infirmière', 5,
   'Ils m''ont trouvé un poste d''infirmière à Lisbonne avec prise en charge du visa. En 4 mois j''étais déjà en train de travailler au Portugal !',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=70', NULL, 6)
ON CONFLICT (id) DO NOTHING;
