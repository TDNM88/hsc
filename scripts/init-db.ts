import { config } from '../config';
import fs from 'fs';
import path from 'path';

async function initDb() {
  if (config.databaseType === 'sqlite') {
    const dbPath = path.resolve(process.cwd(), config.sqlitePath || 'london.db');
    
    // Check if database file exists, create if it doesn't
    if (!fs.existsSync(dbPath)) {
      console.log('Creating SQLite database file...');
      
      // Ensure the directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create an empty file
      fs.writeFileSync(dbPath, '');
      console.log(`SQLite database created at ${dbPath}`);
    } else {
      console.log(`Using existing SQLite database at ${dbPath}`);
    }
  } else {
    console.log('Using PostgreSQL database');
  }
}

initDb().catch(console.error);
