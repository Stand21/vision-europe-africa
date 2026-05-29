-- Fix admin password hash (Admin@2025)
UPDATE admin_users
SET password_hash = '$2b$12$oH5B12uxsau4gpjKltlrVetaYFXsXmxyxllMPrby.ceUafRjpEgCe'
WHERE email = 'admin@visioneuropeafrica.com';
