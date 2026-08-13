-- ============================================================
-- Vision Europe Africa — Correctif de dérive de schéma (Neon)
--
-- Sur certains environnements (Neon en production), la table `destinations`
-- existait déjà avant que les migrations 008/009/010/012 n'ajoutent de
-- nouvelles colonnes. `CREATE TABLE IF NOT EXISTS` ne les a donc jamais
-- ajoutées, et les instructions suivantes de ces fichiers (index, vues,
-- calculs) qui en dépendent ont échoué — annulant, via la transaction
-- implicite de chaque fichier, jusqu'aux instructions qui avaient
-- fonctionné plus tôt dans le même fichier (ex. la création de la table
-- `exchange_rates` dans 012, annulée par l'échec d'une instruction plus
-- loin dans ce même fichier).
--
-- Cette migration ne fait que des opérations idempotentes (IF NOT EXISTS,
-- ON CONFLICT DO NOTHING, CREATE OR REPLACE) : rejouable sans risque sur
-- n'importe quel environnement, qu'il ait déjà ces colonnes ou non.
-- ============================================================

-- ── 1. Colonnes potentiellement manquantes sur `destinations` ────────────────
-- (008) fenêtre de disponibilité
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS available_from  DATE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS available_until DATE;

-- (009) filtres
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS languages       JSONB   NOT NULL DEFAULT '[]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS profiles        JSONB   NOT NULL DEFAULT '["student","worker","visitor"]';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS avg_salary      INT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cost_level      VARCHAR(10);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS visa_weeks_min  INT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS visa_weeks_max  INT;

ALTER TABLE destinations DROP CONSTRAINT IF EXISTS destinations_cost_level_check;
ALTER TABLE destinations ADD  CONSTRAINT destinations_cost_level_check
  CHECK (cost_level IS NULL OR cost_level IN ('low', 'medium', 'high'));

-- (010) textes multilingues
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_i18n        JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tagline_i18n     JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_i18n JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS highlights_i18n  JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS programs_i18n    JSONB NOT NULL DEFAULT '{}';

-- (012) fourchette de salaire
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS salary_min INT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS salary_max INT;

-- ── 2. Colonne `applications.destination` élargie (008) ───────────────────────
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_destination_check;
ALTER TABLE applications ALTER COLUMN destination TYPE VARCHAR(60);

DROP TRIGGER IF EXISTS destinations_updated_at ON destinations;
CREATE TRIGGER destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Vue publique (008/009/010/012) ──────────────────────────────────────────
DROP VIEW IF EXISTS destinations_public;
CREATE VIEW destinations_public AS
  SELECT *
    FROM destinations
   WHERE is_active = true
     AND (available_from  IS NULL OR available_from  <= CURRENT_DATE)
     AND (available_until IS NULL OR available_until >= CURRENT_DATE);

-- ── 4. Seed des 8 destinations (008) — n'écrase rien d'existant ───────────────
INSERT INTO destinations
  (id, code, country_code, name, flag, tagline, description, highlights, programs, image_url, accent_color, is_featured, sort_order)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'germany', 'DE', 'Allemagne', '🇩🇪',
   'Excellence & Opportunité',
   'Première économie européenne, l''Allemagne recrute massivement dans la tech, la santé et l''ingénierie. Universités publiques quasi gratuites et Opportunity Card pour chercher un emploi sur place.',
   '["Salaire moyen 45 000 €/an","Universités publiques gratuites","Opportunity Card","Marché de l''emploi solide"]',
   '["Visa Travail","Visa Étudiant","Opportunity Card","Carte Bleue Européenne"]',
   '/images/germany.jpg', '#635bff', true, 1),

  ('20000000-0000-4000-8000-000000000002', 'portugal', 'PT', 'Portugal', '🇵🇹',
   'Votre première porte vers l''Europe',
   'Le point d''entrée le plus accessible de l''espace Schengen : visa D7, procédures souples et un chemin clair vers la citoyenneté européenne en 5 ans.',
   '["Coût de la vie abordable","Visa D7","Accueil des étudiants","Voie vers la citoyenneté UE"]',
   '["Visa D7","Visa Étudiant","Visa Recherche d''Emploi","Startup Visa"]',
   '/images/portugal.jpg', '#00a36c', true, 2),

  ('20000000-0000-4000-8000-000000000003', 'france', 'FR', 'France', '🇫🇷',
   'La destination francophone',
   'Aucune barrière linguistique pour les candidats francophones. Frais universitaires réduits et le Passeport Talent pour les profils qualifiés.',
   '["Enseignement en français","Frais universitaires réduits","Passeport Talent","Forte diaspora africaine"]',
   '["Visa Étudiant","Passeport Talent","Visa Salarié","Visa Visiteur"]',
   NULL, '#0055a4', false, 3),

  ('20000000-0000-4000-8000-000000000004', 'belgium', 'BE', 'Belgique', '🇧🇪',
   'Le cœur de l''Europe',
   'Siège des institutions européennes, marché du travail bilingue et universités reconnues à Bruxelles, Liège et Louvain.',
   '["Bruxelles, capitale de l''UE","Études en français","Carte Bleue Européenne","Qualité de vie élevée"]',
   '["Visa Étudiant","Carte Bleue Européenne","Permis Unique","Visa Regroupement"]',
   NULL, '#fdda24', false, 4),

  ('20000000-0000-4000-8000-000000000005', 'spain', 'ES', 'Espagne', '🇪🇸',
   'Soleil, études et opportunités',
   'Coût de la vie modéré, visa nomade digital et forte demande de main-d''œuvre dans le tourisme, l''agriculture et la santé.',
   '["Coût de la vie modéré","Visa nomade digital","Régularisation par arraigo","Climat agréable"]',
   '["Visa Étudiant","Visa Nomade Digital","Visa Travail","Visa Non-Lucratif"]',
   NULL, '#c60b1e', false, 5),

  ('20000000-0000-4000-8000-000000000006', 'italy', 'IT', 'Italie', '🇮🇹',
   'Patrimoine et savoir-faire',
   'Le décret flux (Decreto Flussi) ouvre chaque année des quotas de permis de travail, notamment dans la logistique, la santé et l''agroalimentaire.',
   '["Decreto Flussi annuel","Bourses DSU pour étudiants","Secteur santé en tension","Universités historiques"]',
   '["Visa Étudiant","Decreto Flussi","Carte Bleue Européenne","Visa Indépendant"]',
   NULL, '#008c45', false, 6),

  ('20000000-0000-4000-8000-000000000007', 'netherlands', 'NL', 'Pays-Bas', '🇳🇱',
   'Innovation et anglais partout',
   'Plus de 2 000 programmes enseignés en anglais et un visa « année d''orientation » pour rester chercher un emploi après le diplôme.',
   '["Programmes en anglais","Visa Orientation Year","Salaires élevés","Hub tech européen"]',
   '["Visa Étudiant","Orientation Year","Highly Skilled Migrant","Carte Bleue Européenne"]',
   NULL, '#ff6b1a', false, 7),

  ('20000000-0000-4000-8000-000000000008', 'poland', 'PL', 'Pologne', '🇵🇱',
   'L''Europe accessible',
   'Frais de scolarité et coût de la vie parmi les plus bas de l''UE, avec des procédures de visa réputées rapides pour les étudiants africains.',
   '["Frais de scolarité bas","Procédures rapides","Économie en croissance","Porte d''entrée Schengen"]',
   '["Visa Étudiant","Permis de Travail Type A","Carte Bleue Européenne","Visa Business"]',
   NULL, '#dc143c', false, 8)
ON CONFLICT (code) DO NOTHING;

-- ── 5. Backfill filtres (009) — ne touche que les lignes encore vides ─────────
UPDATE destinations SET
  languages      = COALESCE(NULLIF(languages, '[]'::jsonb), d.langs),
  avg_salary     = COALESCE(avg_salary,     d.salary),
  cost_level     = COALESCE(cost_level,     d.cost),
  visa_weeks_min = COALESCE(visa_weeks_min, d.wmin),
  visa_weeks_max = COALESCE(visa_weeks_max, d.wmax)
FROM (VALUES
  ('germany',     '["Allemand","Anglais"]'::jsonb,   45000, 'high',    8, 12),
  ('portugal',    '["Portugais","Anglais"]'::jsonb,  22000, 'low',     6, 10),
  ('france',      '["Français"]'::jsonb,             38000, 'medium',  6, 10),
  ('belgium',     '["Français","Néerlandais"]'::jsonb, 42000, 'medium', 8, 12),
  ('spain',       '["Espagnol","Anglais"]'::jsonb,   28000, 'low',     6, 12),
  ('italy',       '["Italien","Anglais"]'::jsonb,    30000, 'medium',  8, 16),
  ('netherlands', '["Néerlandais","Anglais"]'::jsonb, 48000, 'high',   4,  8),
  ('poland',      '["Polonais","Anglais"]'::jsonb,   24000, 'low',     4,  8)
) AS d(code, langs, salary, cost, wmin, wmax)
WHERE destinations.code = d.code;

UPDATE destinations SET profiles = '["student","worker"]'
 WHERE code IN ('poland', 'netherlands') AND profiles = '["student","worker","visitor"]';

-- ── 6. Backfill i18n (010) ──────────────────────────────────────────────────
UPDATE destinations SET
  name_i18n = jsonb_build_object('fr', name)
  WHERE name_i18n = '{}'::jsonb AND name IS NOT NULL;

UPDATE destinations SET
  tagline_i18n = jsonb_build_object('fr', COALESCE(tagline, ''))
  WHERE tagline_i18n = '{}'::jsonb AND tagline IS NOT NULL;

UPDATE destinations SET
  description_i18n = jsonb_build_object('fr', COALESCE(description, ''))
  WHERE description_i18n = '{}'::jsonb AND description IS NOT NULL;

UPDATE destinations SET
  highlights_i18n = jsonb_build_object('fr', COALESCE(highlights, '[]'::jsonb))
  WHERE highlights_i18n = '{}'::jsonb;

UPDATE destinations SET
  programs_i18n = jsonb_build_object('fr', COALESCE(programs, '[]'::jsonb))
  WHERE programs_i18n = '{}'::jsonb;

UPDATE destinations SET
  name_i18n        = d.name        || name_i18n,
  tagline_i18n     = d.tagline     || tagline_i18n,
  description_i18n = d.description || description_i18n,
  programs_i18n    = d.programs    || programs_i18n,
  highlights_i18n  = d.highlights  || highlights_i18n
FROM (VALUES
  ('germany',
   '{"en":"Germany","pt":"Alemanha","de":"Deutschland"}'::jsonb,
   '{"en":"Excellence & Opportunity","pt":"Excelência e oportunidade","de":"Exzellenz & Chancen"}'::jsonb,
   '{"en":"Europe''s largest economy is hiring heavily in tech, healthcare and engineering. Public universities are almost free, and the Opportunity Card lets you look for work on site.","pt":"A maior economia europeia recruta intensamente em tecnologia, saúde e engenharia. Universidades públicas quase gratuitas e Opportunity Card para procurar emprego no local.","de":"Europas größte Volkswirtschaft sucht Fachkräfte in IT, Gesundheit und Technik. Staatliche Universitäten sind nahezu kostenlos, und die Chancenkarte erlaubt die Jobsuche vor Ort."}'::jsonb,
   '{"en":["Work Visa","Student Visa","Opportunity Card","EU Blue Card"],"pt":["Visto de Trabalho","Visto de Estudante","Opportunity Card","Cartão Azul UE"],"de":["Arbeitsvisum","Studentenvisum","Chancenkarte","Blaue Karte EU"]}'::jsonb,
   '{"en":["Average salary €45,000/yr","Free public universities","Opportunity Card","Strong job market"],"pt":["Salário médio 45 000 €/ano","Universidades públicas gratuitas","Opportunity Card","Mercado de trabalho forte"],"de":["Durchschnittsgehalt 45.000 €/Jahr","Kostenlose staatliche Universitäten","Chancenkarte","Starker Arbeitsmarkt"]}'::jsonb),

  ('portugal',
   '{"en":"Portugal","pt":"Portugal","de":"Portugal"}'::jsonb,
   '{"en":"Your first step into Europe","pt":"A sua primeira porta para a Europa","de":"Ihr erster Schritt nach Europa"}'::jsonb,
   '{"en":"The most accessible gateway to the Schengen area: D7 visa, flexible procedures and a clear path to EU citizenship in 5 years.","pt":"A porta de entrada mais acessível do espaço Schengen: visto D7, procedimentos flexíveis e um caminho claro para a cidadania europeia em 5 anos.","de":"Der zugänglichste Einstieg in den Schengen-Raum: D7-Visum, unkomplizierte Verfahren und ein klarer Weg zur EU-Staatsbürgerschaft in 5 Jahren."}'::jsonb,
   '{"en":["D7 Visa","Student Visa","Job Seeker Visa","Startup Visa"],"pt":["Visto D7","Visto de Estudante","Visto de Procura de Emprego","Visto Startup"],"de":["D7-Visum","Studentenvisum","Jobsuchevisum","Startup-Visum"]}'::jsonb,
   '{"en":["Affordable cost of living","D7 Visa","Student friendly","Path to EU citizenship"],"pt":["Custo de vida acessível","Visto D7","Acolhedor para estudantes","Caminho para a cidadania UE"],"de":["Günstige Lebenshaltungskosten","D7-Visum","Studentenfreundlich","Weg zur EU-Staatsbürgerschaft"]}'::jsonb),

  ('france',
   '{"en":"France","pt":"França","de":"Frankreich"}'::jsonb,
   '{"en":"The French-speaking destination","pt":"O destino francófono","de":"Das französischsprachige Ziel"}'::jsonb,
   '{"en":"No language barrier for French-speaking applicants. Low tuition fees and the Talent Passport for qualified profiles.","pt":"Sem barreira linguística para candidatos francófonos. Propinas reduzidas e o Passaporte Talento para perfis qualificados.","de":"Keine Sprachbarriere für französischsprachige Bewerber. Niedrige Studiengebühren und der Talent-Pass für qualifizierte Profile."}'::jsonb,
   '{"en":["Student Visa","Talent Passport","Employee Visa","Visitor Visa"],"pt":["Visto de Estudante","Passaporte Talento","Visto de Trabalho","Visto de Visitante"],"de":["Studentenvisum","Talent-Pass","Arbeitnehmervisum","Besuchervisum"]}'::jsonb,
   '{"en":["Teaching in French","Low tuition fees","Talent Passport","Large African diaspora"],"pt":["Ensino em francês","Propinas reduzidas","Passaporte Talento","Grande diáspora africana"],"de":["Unterricht auf Französisch","Niedrige Studiengebühren","Talent-Pass","Große afrikanische Diaspora"]}'::jsonb),

  ('belgium',
   '{"en":"Belgium","pt":"Bélgica","de":"Belgien"}'::jsonb,
   '{"en":"The heart of Europe","pt":"O coração da Europa","de":"Das Herz Europas"}'::jsonb,
   '{"en":"Home of the European institutions, a bilingual job market and respected universities in Brussels, Liège and Leuven.","pt":"Sede das instituições europeias, mercado de trabalho bilingue e universidades reconhecidas em Bruxelas, Liège e Lovaina.","de":"Sitz der EU-Institutionen, zweisprachiger Arbeitsmarkt und angesehene Universitäten in Brüssel, Lüttich und Löwen."}'::jsonb,
   '{"en":["Student Visa","EU Blue Card","Single Permit","Family Reunification"],"pt":["Visto de Estudante","Cartão Azul UE","Permissão Única","Reagrupamento Familiar"],"de":["Studentenvisum","Blaue Karte EU","Kombinierte Erlaubnis","Familienzusammenführung"]}'::jsonb,
   '{"en":["Brussels, EU capital","Studies in French","EU Blue Card","High quality of life"],"pt":["Bruxelas, capital da UE","Estudos em francês","Cartão Azul UE","Elevada qualidade de vida"],"de":["Brüssel, EU-Hauptstadt","Studium auf Französisch","Blaue Karte EU","Hohe Lebensqualität"]}'::jsonb),

  ('spain',
   '{"en":"Spain","pt":"Espanha","de":"Spanien"}'::jsonb,
   '{"en":"Sun, study and opportunity","pt":"Sol, estudos e oportunidades","de":"Sonne, Studium und Chancen"}'::jsonb,
   '{"en":"Moderate cost of living, a digital nomad visa and strong labour demand in tourism, agriculture and healthcare.","pt":"Custo de vida moderado, visto de nómada digital e forte procura de mão de obra no turismo, agricultura e saúde.","de":"Moderate Lebenshaltungskosten, ein Digital-Nomaden-Visum und hohe Nachfrage in Tourismus, Landwirtschaft und Gesundheitswesen."}'::jsonb,
   '{"en":["Student Visa","Digital Nomad Visa","Work Visa","Non-Lucrative Visa"],"pt":["Visto de Estudante","Visto de Nómada Digital","Visto de Trabalho","Visto Não Lucrativo"],"de":["Studentenvisum","Digital-Nomaden-Visum","Arbeitsvisum","Nicht-Erwerbsvisum"]}'::jsonb,
   '{"en":["Moderate cost of living","Digital nomad visa","Arraigo regularisation","Pleasant climate"],"pt":["Custo de vida moderado","Visto de nómada digital","Regularização por arraigo","Clima agradável"],"de":["Moderate Lebenshaltungskosten","Digital-Nomaden-Visum","Regularisierung per Arraigo","Angenehmes Klima"]}'::jsonb),

  ('italy',
   '{"en":"Italy","pt":"Itália","de":"Italien"}'::jsonb,
   '{"en":"Heritage and craftsmanship","pt":"Património e saber-fazer","de":"Kulturerbe und Handwerk"}'::jsonb,
   '{"en":"The annual Decreto Flussi opens work permit quotas, notably in logistics, healthcare and food processing.","pt":"O Decreto Flussi anual abre quotas de autorizações de trabalho, sobretudo em logística, saúde e agroalimentar.","de":"Das jährliche Decreto Flussi öffnet Kontingente für Arbeitserlaubnisse, vor allem in Logistik, Gesundheit und Lebensmittelindustrie."}'::jsonb,
   '{"en":["Student Visa","Decreto Flussi","EU Blue Card","Self-Employment Visa"],"pt":["Visto de Estudante","Decreto Flussi","Cartão Azul UE","Visto de Trabalho Independente"],"de":["Studentenvisum","Decreto Flussi","Blaue Karte EU","Selbstständigenvisum"]}'::jsonb,
   '{"en":["Annual Decreto Flussi","DSU student grants","Healthcare in high demand","Historic universities"],"pt":["Decreto Flussi anual","Bolsas DSU para estudantes","Setor da saúde em falta","Universidades históricas"],"de":["Jährliches Decreto Flussi","DSU-Stipendien für Studenten","Gesundheitssektor mit Bedarf","Traditionsreiche Universitäten"]}'::jsonb),

  ('netherlands',
   '{"en":"Netherlands","pt":"Países Baixos","de":"Niederlande"}'::jsonb,
   '{"en":"Innovation, and English everywhere","pt":"Inovação e inglês em todo o lado","de":"Innovation und überall Englisch"}'::jsonb,
   '{"en":"Over 2,000 programmes taught in English and an orientation year visa to stay and look for work after graduation.","pt":"Mais de 2 000 programas leccionados em inglês e um visto de ano de orientação para procurar emprego após a graduação.","de":"Über 2.000 englischsprachige Studiengänge und ein Orientierungsjahr-Visum für die Jobsuche nach dem Abschluss."}'::jsonb,
   '{"en":["Student Visa","Orientation Year","Highly Skilled Migrant","EU Blue Card"],"pt":["Visto de Estudante","Ano de Orientação","Migrante Altamente Qualificado","Cartão Azul UE"],"de":["Studentenvisum","Orientierungsjahr","Hochqualifizierte Fachkraft","Blaue Karte EU"]}'::jsonb,
   '{"en":["Programmes in English","Orientation Year visa","High salaries","European tech hub"],"pt":["Programas em inglês","Visto de Ano de Orientação","Salários elevados","Polo tecnológico europeu"],"de":["Studiengänge auf Englisch","Orientierungsjahr-Visum","Hohe Gehälter","Europäischer Tech-Hub"]}'::jsonb),

  ('poland',
   '{"en":"Poland","pt":"Polónia","de":"Polen"}'::jsonb,
   '{"en":"Accessible Europe","pt":"A Europa acessível","de":"Das zugängliche Europa"}'::jsonb,
   '{"en":"Among the lowest tuition fees and living costs in the EU, with visa procedures known to be fast for African students.","pt":"Entre as propinas e custos de vida mais baixos da UE, com procedimentos de visto reconhecidamente rápidos para estudantes africanos.","de":"Mit die niedrigsten Studiengebühren und Lebenshaltungskosten der EU, bei bekannt schnellen Visumsverfahren für afrikanische Studenten."}'::jsonb,
   '{"en":["Student Visa","Type A Work Permit","EU Blue Card","Business Visa"],"pt":["Visto de Estudante","Autorização de Trabalho Tipo A","Cartão Azul UE","Visto de Negócios"],"de":["Studentenvisum","Arbeitserlaubnis Typ A","Blaue Karte EU","Geschäftsvisum"]}'::jsonb,
   '{"en":["Low tuition fees","Fast procedures","Growing economy","Schengen gateway"],"pt":["Propinas baixas","Procedimentos rápidos","Economia em crescimento","Porta de entrada Schengen"],"de":["Niedrige Studiengebühren","Schnelle Verfahren","Wachsende Wirtschaft","Schengen-Zugang"]}'::jsonb)
) AS d(code, name, tagline, description, programs, highlights)
WHERE destinations.code = d.code;

-- ── 7. Fourchette de salaire (012) ─────────────────────────────────────────────
UPDATE destinations
   SET salary_min = ROUND(avg_salary * 0.8),
       salary_max = ROUND(avg_salary * 1.35)
 WHERE avg_salary IS NOT NULL AND salary_min IS NULL;

-- ── 8. Taux de change (012) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exchange_rates (
  code        VARCHAR(10)   PRIMARY KEY,
  rate        NUMERIC(20,6) NOT NULL CHECK (rate > 0),
  source      VARCHAR(30)   NOT NULL DEFAULT 'seed',
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('rates_last_refresh', '', 'Horodatage du dernier rafraîchissement des taux de change'),
  ('rates_base', 'EUR', 'Devise de référence dans laquelle les montants sont stockés')
ON CONFLICT (key) DO NOTHING;

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
