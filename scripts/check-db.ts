import Database from 'better-sqlite3';
import { config } from '../config';
import path from 'path';

interface TableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface TableRow {
  name: string;
  [key: string]: any;
}

async function checkDatabase() {
  console.log('Starting database check...');
  
  try {
    const dbPath = path.resolve(process.cwd(), config.sqlitePath || 'london.db');
    console.log(`🔍 Checking database at: ${dbPath}`);
    
    // Check if database file exists
    const fs = await import('fs');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Error: Database file does not exist');
      console.log('💡 Please run `npm run init:db` to create the database file.');
      return;
    }
    
    const stats = fs.statSync(dbPath);
    console.log('✅ Database file exists');
    console.log('📊 File stats:', {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    });
    
    // Connect to the database
    console.log('🔌 Connecting to database...');
    const db = new Database(dbPath, { verbose: console.log });
    console.log('✅ Successfully connected to database');
    
    // Test a simple query
    try {
      const testQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
      const tables = testQuery.all();
      console.log('📋 Tables in database:', tables);
    } catch (error) {
      console.error('❌ Error executing test query:', error);
      return;
    }
    
    try {
      // List all tables
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all() as TableRow[];
      
      console.log('\nTables in database:');
      console.table(tables);
      
      // Show schema for each table
      for (const table of tables) {
        console.log(`\nSchema for table ${table.name}:`);
        const schema = db.prepare(
          `PRAGMA table_info(${table.name})`
        ).all() as TableInfo[];
        console.table(schema);
      }
      
      // Check _migrations table
      console.log('\nApplied migrations:');
      try {
        const migrations = db.prepare('SELECT * FROM _migrations').all();
        console.table(migrations);
      } catch (e) {
        console.log('No _migrations table found');
      }
      
    } finally {
      // Close the database connection
      db.close();
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkDatabase().catch(console.error);
