import { dbPool } from '../lib/db';

async function verifyMigration() {
  const client = await dbPool.connect();
  
  try {
    // Query the information_schema to check if the column exists
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'last_login';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Migration successful! The last_login column exists in the users table.');
      console.log('Column details:', result.rows[0]);
    } else {
      console.error('❌ Migration failed: The last_login column does not exist in the users table.');
    }
  } catch (error) {
    console.error('Error verifying migration:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

verifyMigration();
