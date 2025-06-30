import { config } from '../config';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

async function setupDatabase() {
  try {
    const dbPath = path.resolve(process.cwd(), config.sqlitePath || 'london.db');
    console.log(`Setting up database at: ${dbPath}`);
    
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Connect to SQLite database
    const db = new Database(dbPath);
    
    try {
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
      
      // Read and execute the schema file
      const schemaPath = path.join(__dirname, '..', 'db', 'migrations', '20240626_initial_schema.sql');
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`);
      }
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
      console.log('\nExecuting schema...');
      
      // Split the SQL by semicolon and execute each statement
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement in a transaction
      const transaction = db.transaction(() => {
        for (const stmt of statements) {
          try {
            db.exec(stmt + ';');
          } catch (e) {
            console.error('Error executing statement:', stmt);
            throw e;
          }
        }
        
        // Create migrations table if it doesn't exist
        db.exec(`
          CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Record this migration
        db.prepare(
          'INSERT OR IGNORE INTO _migrations (name) VALUES (?)'
        ).run('20240626_initial_schema.sql');
      });
      
      transaction();
      
      console.log('\n✅ Database schema created successfully!');
      
      // Verify tables were created
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all();
      
      console.log('\nTables created:');
      console.table(tables);
      
    } finally {
      // Close the database connection
      db.close();
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);
