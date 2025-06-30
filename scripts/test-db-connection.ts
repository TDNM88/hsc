// @ts-check
const Database = require('better-sqlite3');
import { config } from '../config';
import path from 'path';
import fs from 'fs';

// Log environment for debugging
console.log('\n=== Environment ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
console.log('SQLITE_PATH:', process.env.SQLITE_PATH);
console.log('==================\n');

// Force synchronous execution for better error handling
function testConnection() {
  console.log('🚀 Starting database connection test...');
  
  try {
    // Resolve database path
    const dbPath = path.resolve(process.cwd(), config.sqlitePath || 'london.db');
    console.log(`🔍 Database path: ${dbPath}`);
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Error: Database file does not exist');
      console.log('💡 Please run `npm run init:db` to create the database file.');
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(dbPath);
    console.log('✅ Database file exists');
    console.log('📊 File stats:', {
      size: `${(stats.size / 1024).toFixed(2)} KB`,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString()
    });
    
    // Connect to the database
    console.log('🔌 Connecting to database...');
    let db;
    try {
      db = new Database(dbPath, { verbose: console.log });
      console.log('✅ Successfully connected to database');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to connect to database:', errorMessage);
      console.error('Full error:', error);
      console.log('\nTroubleshooting steps:');
      console.log('1. Make sure the database file exists and is accessible');
      console.log('2. Check file permissions for the database file');
      console.log('3. Try deleting the database file and running `npm run init:db` again');
      return;
    }
    
    try {
      // Test a simple query
      console.log('\n🔍 Running test query...');
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log('📋 Tables in database:', JSON.stringify(tables, null, 2));
      
      if (tables.length === 0) {
        console.log('ℹ️ No tables found in the database');
      } else {
        // For each table, show its structure
        for (const table of tables) {
          try {
            console.log(`\n📊 Table: ${table.name}`);
            const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
            console.log('   Columns:', JSON.stringify(columns, null, 2));
            
            // Show row count
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
            console.log(`   Row count: ${count?.count || 0}`);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`   Error getting info for table ${table.name}:`, errorMessage);
          }
        }
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error executing test query:', errorMessage);
    } finally {
      // Close the database connection
      db.close();
      console.log('\n🔌 Database connection closed');
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ An error occurred:', errorMessage);
  } finally {
    console.log('\n🏁 Test completed');
  }
}

// Run the test
try {
  testConnection();
} catch (error) {
  console.error('❌ Unhandled error in test:', error);
}
