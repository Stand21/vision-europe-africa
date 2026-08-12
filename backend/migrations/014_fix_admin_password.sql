-- ============================================================
-- Vision Europe Africa — Réparation du mot de passe administrateur
--
-- L'empreinte livrée dans la migration 001 ne correspondait à aucun mot de
-- passe connu : la connexion à /admin échouait sur toute installation
-- existante, malgré les identifiants annoncés dans le README.
--
-- On ne répare que ce cas précis. Un mot de passe déjà changé (par l'admin ou
-- par scripts/reset_admin_prod.js) porte une autre empreinte et n'est pas touché.
-- ============================================================

UPDATE admin_users
   SET password_hash = '$2a$12$shDVlsJ1nKqnc1eLUiKPBOoj5hrKXUCmmyh/WbQFQmrXggyajEiem'
 WHERE email = 'admin@visioneuropeafrica.com'
   AND password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Ley.b7J8XC5qzqXxG';
