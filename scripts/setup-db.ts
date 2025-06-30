import { config } from '../config';
import { db, sql } from '../lib/db';
import path from 'path';
import fs from 'fs';

async function setupDatabase() {
  try {
    console.log('Thiết lập PostgreSQL database...');
    
    // Kiểm tra kết nối đến PostgreSQL
    if (!config.database.url) {
      throw new Error('DATABASE_URL không được cấu hình trong biến môi trường');
    }
    
    console.log('Kết nối đến PostgreSQL...');
    const result = await sql`SELECT version();`;
    console.log('Kết nối thành công đến PostgreSQL:', result[0].version);
    
    // Đọc và thực thi file schema
    const schemaPath = path.join(__dirname, '..', 'db', 'migrations', '20240626_initial_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    console.log('\nThực thi schema...');
    
    // Tạo bảng migrations nếu chưa tồn tại
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Thực thi schema trong một transaction
    await db.transaction(async (tx: any) => {
      try {
        // Thực thi SQL schema - sử dụng sql trực tiếp thay vì sql.raw
        await sql`${schemaSQL}`;
        
        // Ghi nhận migration này
        await sql`
          INSERT INTO _migrations (name) 
          VALUES (${'20240626_initial_schema.sql'}) 
          ON CONFLICT (name) DO NOTHING
        `;
        
        console.log('\n✅ Database schema đã được tạo thành công!');
      } catch (e) {
        console.error('Lỗi khi thực thi schema:', e);
        throw e;
      }
    });
    
    // Kiểm tra các bảng đã được tạo
    const tables = await sql`
      SELECT table_name as name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\nCác bảng đã tạo:');
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);
