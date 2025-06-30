import { config } from '../config';
import { db, sql } from '../lib/db';

async function initDb() {
  try {
    console.log('Initializing PostgreSQL database...');
    
    // Kiểm tra kết nối đến PostgreSQL
    if (!config.database.url) {
      throw new Error('DATABASE_URL không được cấu hình trong biến môi trường');
    }
    
    console.log('Kiểm tra kết nối đến PostgreSQL...');
    const result = await sql`SELECT version();`;
    console.log('Kết nối thành công đến PostgreSQL:', result[0].version);
    
    // Kiểm tra các bảng trong database
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Các bảng hiện có trong database:');
    if (tables.length === 0) {
      console.log('Không có bảng nào. Database trống.');
    } else {
      tables.forEach((table: any) => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    console.log('Khởi tạo database hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi khởi tạo database:', error);
    throw error;
  }
}

initDb().catch(console.error);
