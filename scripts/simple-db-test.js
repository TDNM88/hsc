const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('Starting simple database test...');
console.log('Current directory:', process.cwd());

// Path to the database file
const dbPath = path.resolve(process.cwd(), 'london.db');
console.log('Database path:', dbPath);

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Error: Database file does not exist at', dbPath);
  console.log('Please run `npm run init:db` to create the database file.');
  process.exit(1);
}

console.log('Database file exists');

// Try to connect to the database
try {
  console.log('Attempting to connect to database...');
  const db = new Database(dbPath, { verbose: console.log });
  
  console.log('Successfully connected to database');
  
  // Test a simple query
  console.log('\nRunning test query...');
  const result = db.prepare("SELECT 'Hello, SQLite!' as message").get();
  console.log('Test query result:', result);
  
  // List all tables
  console.log('\nListing all tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in database:', tables);
  
  // Close the database connection
  db.close();
  console.log('\nDatabase connection closed');
  
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log('\nTest completed');
