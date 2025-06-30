import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Starting SQLite migrations...');
  
  // Ensure database directory exists
  const dbPath = path.resolve(process.cwd(), config.sqlitePath || 'london.db');
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
    
    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of executed migrations
    const executedMigrations = new Set(
      db.prepare('SELECT name FROM _migrations').all().map((m: any) => m.name)
    );
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    let migrationsRun = 0;
    
    // Run migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        console.log(`Running migration: ${file}`);
        
        // Read and execute migration file
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        
        // Wrap in a transaction
        const transaction = db.transaction(() => {
          db.exec(migrationSQL);
          
          // Record migration
          db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
        });
        
        try {
          transaction();
          console.log(`✓ Successfully applied migration: ${file}`);
          migrationsRun++;
        } catch (error) {
          console.error(`❌ Error applying migration ${file}:`, error);
          throw error;
        }
      }
    }
    
    if (migrationsRun === 0) {
      console.log('No new migrations to run.');
    } else {
      console.log(`\nSuccessfully ran ${migrationsRun} migration(s).`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run migrations
runMigrations().catch(console.error);
