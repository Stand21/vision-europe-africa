-- ============================================================
-- Vision Europe Africa — Destinations multilingues
--
-- Les textes éditoriaux d'une destination passent en JSONB indexé par langue :
--   tagline = {"fr": "Votre première porte...", "en": "Your first step...", ...}
-- Le français reste la langue de repli : une langue absente affiche le français.
--
-- Le contenu français déjà saisi est conservé et déplacé sous la clé "fr".
-- ============================================================

-- ── 1. Nouvelles colonnes ─────────────────────────────────────────────────────
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_i18n        JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tagline_i18n     JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_i18n JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS highlights_i18n  JSONB NOT NULL DEFAULT '{}';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS programs_i18n    JSONB NOT NULL DEFAULT '{}';

-- ── 2. Reprise du contenu français existant ───────────────────────────────────
-- Ne s'applique qu'aux lignes pas encore migrées, donc rejouable sans risque.
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

-- ── 3. Traductions des 8 pays du seed ─────────────────────────────────────────
-- On ne complète que les langues encore absentes : toute traduction saisie
-- depuis l'admin est préservée.
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

-- ── 4. Vue publique reconstruite ──────────────────────────────────────────────
DROP VIEW IF EXISTS destinations_public;
CREATE VIEW destinations_public AS
  SELECT *
    FROM destinations
   WHERE is_active = true
     AND (available_from  IS NULL OR available_from  <= CURRENT_DATE)
     AND (available_until IS NULL OR available_until >= CURRENT_DATE);
