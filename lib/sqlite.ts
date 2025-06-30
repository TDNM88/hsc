import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { isDevelopment } from '../config';

// Create SQLite database connection
const sqlite = new Database('london.db');

// Enable foreign key constraints
sqlite.pragma('foreign_keys = ON');

// Create Drizzle instance with SQLite
const db = drizzle(sqlite, { 
  schema,
  logger: isDevelopment(),
});

export { sqlite, db };
export default db;
