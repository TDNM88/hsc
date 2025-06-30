import { db, sql } from '../lib/db';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Kết nối đến PostgreSQL...');
    const result = await sql`SELECT version();`;
    console.log('Kết nối thành công đến PostgreSQL:', result[0].version);
    
    // Thực thi migration trong một transaction
    await db.transaction(async (tx: any) => {
      // Đọc file migration
      const migrationPath = join(__dirname, '..', 'db', 'migrations', '20240626_add_last_login_to_users.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      console.log('Đang chạy migration...');
      // Thực thi SQL migration
      await sql`${migrationSQL}`;
      
      // Ghi nhận migration vào bảng _migrations
      await sql`
        INSERT INTO _migrations (name) 
        VALUES (${'20240626_add_last_login_to_users.sql'}) 
        ON CONFLICT (name) DO NOTHING
      `;
      
      console.log('Migration hoàn thành thành công!');
    });
  } catch (error) {
    console.error('Migration thất bại:', error);
    process.exit(1);
  }
}

runMigration().catch(console.error);
