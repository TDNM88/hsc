import { config } from '../../config';
import * as schema from '../schema';

type DatabaseType = 'postgres' | 'sqlite';

let db: any;
let dbPool: any;

async function initializeDatabase() {
  const dbType = config.databaseType as DatabaseType;

  if (dbType === 'postgres') {
    // PostgreSQL configuration
    const { Client } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    
    const client = new Client({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
    });
    
    await client.connect();
    
    db = drizzle(client, { 
      schema,
      logger: config.nodeEnv === 'development',
    });
    
    dbPool = client;
  } else {
    // SQLite configuration
    const Database = (await import('better-sqlite3')).default;
    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    
    const sqlite = new Database(config.sqlitePath || 'london.db');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    
    db = drizzle(sqlite, { 
      schema,
      logger: config.nodeEnv === 'development',
    });
    
    dbPool = sqlite;
  }
}

// Initialize the database
initializeDatabase().catch(console.error);

export { db, dbPool };
export default db;
