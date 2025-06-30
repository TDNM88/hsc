import { dbPool } from '../lib/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = await dbPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute the migration SQL
    const migrationPath = join(__dirname, '..', 'db', 'migrations', '20240626_add_last_login_to_users.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('Running migration...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigration().catch(console.error);
