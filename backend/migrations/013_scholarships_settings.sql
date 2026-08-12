-- ============================================================
-- Vision Europe Africa — Réglages liés aux bourses d'études
--
-- Le numéro WhatsApp affiché à côté de chaque bourse est modifiable depuis
-- l'administration : pas besoin de redéployer pour en changer.
-- ============================================================

INSERT INTO settings (key, value, description) VALUES
  ('whatsapp_number', '', 'Numéro WhatsApp au format international, sans + ni espaces (ex. 243999000000)'),
  ('whatsapp_message', 'Bonjour, je suis intéressé(e) par la bourse : ',
   'Début du message pré-rempli ; le nom de la bourse est ajouté automatiquement'),
  ('scholarships_enabled', 'true', 'Afficher ou non la section Bourses sur le site')
ON CONFLICT (key) DO NOTHING;
