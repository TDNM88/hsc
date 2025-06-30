import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config';
import { db, sql } from '../lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Starting PostgreSQL migrations...');
  
  // Kiểm tra kết nối đến PostgreSQL
  if (!config.database.url) {
    throw new Error('DATABASE_URL không được cấu hình trong biến môi trường');
  }
  
  console.log('Kết nối đến PostgreSQL...');
  const result = await sql`SELECT version();`;
  console.log('Kết nối thành công đến PostgreSQL:', result[0].version);
  
  try {
    // Tạo bảng migrations nếu chưa tồn tại
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Lấy danh sách các migrations đã thực hiện
    const executedMigrationsResult = await sql`SELECT name FROM _migrations`;
    const executedMigrations = new Set(
      executedMigrationsResult.map((m: any) => m.name)
    );
    
    // Lấy tất cả các file migration
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    let migrationsRun = 0;
    
    // Thực hiện migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        console.log(`Đang chạy migration: ${file}`);
        
        // Đọc và thực thi file migration
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        
        // Thực hiện trong transaction
        await db.transaction(async (tx: any) => {
          // Thực thi SQL migration sử dụng sql trực tiếp
          await sql`${migrationSQL}`;
          
          // Ghi nhận migration
          await sql`INSERT INTO _migrations (name) VALUES (${file})`;
        });
        
        console.log(`✓ Đã áp dụng thành công migration: ${file}`);
        migrationsRun++;
      }
    }
    
    if (migrationsRun === 0) {
      console.log('Không có migration mới nào để chạy.');
    } else {
      console.log(`\nĐã chạy thành công ${migrationsRun} migration(s).`);
    }
    
  } catch (error) {
    console.error('Migration thất bại:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch(console.error);
