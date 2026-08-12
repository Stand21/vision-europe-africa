-- ============================================================
-- Vision Europe Africa — Témoignages multilingues
--
-- Même principe que les destinations : le texte, le métier et la ville
-- deviennent des objets JSONB indexés par langue, avec repli sur le français.
-- Le nom et le pays d'origine restent tels quels (noms propres).
-- ============================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS text_i18n        JSONB NOT NULL DEFAULT '{}';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS role_i18n        JSONB NOT NULL DEFAULT '{}';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS destination_i18n JSONB NOT NULL DEFAULT '{}';

-- ── Reprise du contenu français existant ──────────────────────────────────────
UPDATE testimonials SET text_i18n = jsonb_build_object('fr', text)
  WHERE text_i18n = '{}'::jsonb AND text IS NOT NULL;

UPDATE testimonials SET role_i18n = jsonb_build_object('fr', role)
  WHERE role_i18n = '{}'::jsonb AND role IS NOT NULL;

UPDATE testimonials SET destination_i18n = jsonb_build_object('fr', destination)
  WHERE destination_i18n = '{}'::jsonb AND destination IS NOT NULL;

-- ── Traductions des 6 témoignages du seed ─────────────────────────────────────
-- Seules les langues encore absentes sont ajoutées : toute saisie faite depuis
-- l'admin est préservée.
UPDATE testimonials SET
  text_i18n        = d.text || text_i18n,
  role_i18n        = d.role || role_i18n,
  destination_i18n = d.city || destination_i18n
FROM (VALUES
  ('10000000-0000-4000-8000-000000000001'::uuid,
   '{"en":"Vision Europe Africa changed my life. The team guided me step by step through the German work visa. I now earn €55,000 a year in Berlin!","pt":"A Vision Europe Africa mudou a minha vida. A equipa guiou-me passo a passo no visto de trabalho alemão. Agora ganho 55 000 € por ano em Berlim!","de":"Vision Europe Africa hat mein Leben verändert. Das Team hat mich Schritt für Schritt durch das deutsche Arbeitsvisum begleitet. Heute verdiene ich 55.000 € im Jahr in Berlin!"}'::jsonb,
   '{"fr":"Ingénieur logiciel","en":"Software Engineer","pt":"Engenheiro de software","de":"Softwareentwickler"}'::jsonb,
   '{"en":"Berlin","pt":"Berlim","de":"Berlin"}'::jsonb),

  ('10000000-0000-4000-8000-000000000002'::uuid,
   '{"en":"I got my student visa for Lisbon in 3 months. The team is very professional and available. I highly recommend them!","pt":"Consegui o meu visto de estudante para Lisboa em 3 meses. A equipa é muito profissional e disponível. Recomendo vivamente!","de":"Ich habe mein Studentenvisum für Lissabon in 3 Monaten erhalten. Das Team ist sehr professionell und erreichbar. Klare Empfehlung!"}'::jsonb,
   '{"fr":"Étudiante en médecine","en":"Medical Student","pt":"Estudante de Medicina","de":"Medizinstudentin"}'::jsonb,
   '{"en":"Lisbon","pt":"Lisboa","de":"Lissabon"}'::jsonb),

  ('10000000-0000-4000-8000-000000000003'::uuid,
   '{"en":"Professional, transparent and efficient. They handled all my paperwork and I received my German work permit faster than expected.","pt":"Profissional, transparente e eficiente. Trataram de toda a documentação e recebi a minha autorização de trabalho alemã mais rápido do que esperava.","de":"Professionell, transparent und effizient. Sie haben alle meine Unterlagen bearbeitet und ich erhielt meine deutsche Arbeitserlaubnis schneller als erwartet."}'::jsonb,
   '{"fr":"Logisticien","en":"Logistics Specialist","pt":"Especialista em logística","de":"Logistiker"}'::jsonb,
   '{"en":"Hamburg","pt":"Hamburgo","de":"Hamburg"}'::jsonb),

  ('10000000-0000-4000-8000-000000000004'::uuid,
   '{"en":"The process was clear with no surprises. Vision Europe Africa supported me from the first contact until my arrival in Porto.","pt":"O processo foi claro e sem surpresas. A Vision Europe Africa acompanhou-me desde o primeiro contacto até à minha chegada ao Porto.","de":"Der Ablauf war klar und ohne Überraschungen. Vision Europe Africa hat mich vom ersten Kontakt bis zu meiner Ankunft in Porto begleitet."}'::jsonb,
   '{"fr":"Étudiante en commerce","en":"Business Student","pt":"Estudante de Gestão","de":"BWL-Studentin"}'::jsonb,
   '{"en":"Porto","pt":"Porto","de":"Porto"}'::jsonb),

  ('10000000-0000-4000-8000-000000000005'::uuid,
   '{"en":"I was sceptical, but the team proved extremely competent. My Opportunity Card application was accepted on the first try!","pt":"Estava céptico, mas a equipa mostrou-se extremamente competente. A minha candidatura ao Opportunity Card foi aceite à primeira!","de":"Ich war skeptisch, doch das Team erwies sich als äußerst kompetent. Mein Antrag für die Chancenkarte wurde auf Anhieb angenommen!"}'::jsonb,
   '{"fr":"Spécialiste IT","en":"IT Specialist","pt":"Especialista em TI","de":"IT-Spezialist"}'::jsonb,
   '{"en":"Munich","pt":"Munique","de":"München"}'::jsonb),

  ('10000000-0000-4000-8000-000000000006'::uuid,
   '{"en":"They found me a nursing post in Lisbon with the visa handled. Within 4 months I was already working in Portugal!","pt":"Encontraram-me um posto de enfermagem em Lisboa com o visto tratado. Em 4 meses já estava a trabalhar em Portugal!","de":"Sie haben mir eine Pflegestelle in Lissabon vermittelt, samt Visum. Nach 4 Monaten arbeitete ich bereits in Portugal!"}'::jsonb,
   '{"fr":"Infirmière","en":"Nurse","pt":"Enfermeira","de":"Pflegefachkraft"}'::jsonb,
   '{"en":"Lisbon","pt":"Lisboa","de":"Lissabon"}'::jsonb)
) AS d(id, text, role, city)
WHERE testimonials.id = d.id;
