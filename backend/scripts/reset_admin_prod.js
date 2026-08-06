const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.argv[2];
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable or argument is required');
    console.log('Usage:');
    console.log('  1. Set DATABASE_URL env var (from Neon dashboard)');
    console.log('  2. Or pass it as argument: node scripts/reset_admin_prod.js "postgresql://..." [password] [email]');
    process.exit(1);
  }

  const password = process.argv[2] || 'Admin@2026';
  const email = process.argv[3] || 'admin@visioneuropeafrica.com';

  const hash = bcrypt.hashSync(password, 12);
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const updateRes = await client.query(
      'UPDATE admin_users SET password_hash = $1 WHERE email = $2',
      [hash, email]
    );

    if (updateRes.rowCount === 0) {
      console.log('⚠️  No admin user found with that email. Creating one...');
      await client.query(
        'INSERT INTO admin_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Admin', email, hash, 'superadmin']
      );
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin password updated');
    }

    const verifyRes = await client.query(
      'SELECT email, role, is_active FROM admin_users WHERE email = $1',
      [email]
    );
    console.log('📋 Current admin:', JSON.stringify(verifyRes.rows[0], null, 2));
    console.log('🔑 Password:', password);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
