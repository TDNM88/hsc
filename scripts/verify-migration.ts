import { sql } from '../lib/db';

async function verifyMigration() {
  try {
    console.log('Kiểm tra migration...');
    
    // Truy vấn information_schema để kiểm tra cột tồn tại
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'last_login'
    `;

    if (result.length > 0) {
      console.log('✅ Migration thành công! Cột last_login đã tồn tại trong bảng users.');
      console.log('Chi tiết cột:', result[0]);
    } else {
      console.error('❌ Migration thất bại: Cột last_login không tồn tại trong bảng users.');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra migration:', error);
    process.exit(1);
  }
}

verifyMigration();
