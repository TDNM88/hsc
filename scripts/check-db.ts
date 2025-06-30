import { config } from '../config';
import path from 'path';
import { db, sql as dbSql } from '../lib/db';
import { sql } from 'drizzle-orm';

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: any;
}

interface TableRow {
  name: string;
  [key: string]: any;
}

async function checkDatabase() {
  console.log('Starting database check...');
  
  try {
    // Kiểm tra kết nối đến PostgreSQL
    console.log(`🔍 Checking database connection to: ${config.database.url.split('@')[1] || 'PostgreSQL database'}`);
    
    // Kiểm tra kết nối đến database
    console.log('🔌 Connecting to database...');
    
    try {
      // Thực hiện một truy vấn đơn giản để kiểm tra kết nối
      const result = await dbSql`SELECT current_database(), current_user, version();`;
      console.log('✅ Successfully connected to database');
      console.log('📊 Database info:', {
        database: result[0]?.current_database,
        user: result[0]?.current_user,
        version: result[0]?.version
      });
    } catch (error) {
      console.error('❌ Error connecting to database:', error);
      console.log('💡 Please check your database connection settings in .env file.');
      return;
    }
    
    // Kiểm tra các bảng trong database
    try {
      const tablesResult = await dbSql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      const tables = tablesResult as unknown as { table_name: string }[];
      
      if (tables.length === 0) {
        console.warn('⚠️ No tables found in the database');
        console.log('💡 Please run migrations to initialize the database schema.');
        return;
      }
      
      console.log(`✅ Found ${tables.length} tables in the database:`);
      tables.forEach((table) => {
        console.log(`  - ${table.table_name}`);
      });
      
      // Kiểm tra cấu trúc của mỗi bảng
      for (const table of tables) {
        console.log(`\n📋 Checking table: ${table.table_name}`);
        
        const columnsResult = await dbSql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = ${table.table_name}
        `;
        
        const columns = columnsResult as unknown as TableInfo[];
        
        if (columns.length === 0) {
          console.warn(`⚠️ Table ${table.table_name} has no columns`);
          continue;
        }
        
        console.log(`  Found ${columns.length} columns:`);
        columns.forEach((column) => {
          const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = column.column_default ? `DEFAULT ${column.column_default}` : '';
          console.log(`  - ${column.column_name} (${column.data_type} ${nullable} ${defaultValue})`);
        });
        
        // Kiểm tra số lượng bản ghi trong bảng
        const countResult = await dbSql`SELECT COUNT(*) as count FROM ${sql.identifier(table.table_name)}`;
        const count = countResult[0]?.count || 0;
        
        console.log(`  Table has ${count} rows`);
      }
    } catch (error) {
      console.error('❌ Error querying database schema:', error);
    }
    
    // Neon HTTP client không cần đóng kết nối
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkDatabase().catch(console.error);
