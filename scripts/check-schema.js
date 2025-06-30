const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file
const dbPath = path.resolve(process.cwd(), 'london.db');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Error: Database file not found at ${dbPath}`);
  process.exit(1);
}

console.log(`🔍 Checking database at: ${dbPath}`);

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to the SQLite database');
  
  // List all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_drizzle_%'", [], (err, tables) => {
    if (err) {
      console.error('❌ Error listing tables:', err.message);
      db.close();
      return;
    }
    
    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('No tables found in the database');
      db.close();
      return;
    }
    
    console.table(tables.map(t => ({ name: t.name })));
    
    // For each table, show its structure
    let tablesProcessed = 0;
    
    tables.forEach((table) => {
      const tableName = table.name;
      
      // Get table info
      db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
        if (err) {
          console.error(`❌ Error getting info for table ${tableName}:`, err.message);
        } else {
          console.log(`\n📊 Table: ${tableName}`);
          console.table(columns.map(col => ({
            column: col.name,
            type: col.type,
            notnull: col.notnull ? 'YES' : 'NO',
            default: col.dflt_value,
            pk: col.pk ? 'YES' : 'NO'
          })));
          
          // Get row count
          db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
            if (err) {
              console.error(`❌ Error getting row count for ${tableName}:`, err.message);
            } else {
              console.log(`   📊 Row count: ${row.count}`);
              
              // For users table, show sample data
              if (tableName === 'users' && row.count > 0) {
                db.all(`SELECT id, username, email, name, created_at FROM ${tableName} LIMIT 5`, [], (err, rows) => {
                  if (!err && rows.length > 0) {
                    console.log('\n👥 Sample users:');
                    console.table(rows);
                  }
                  checkIfDone();
                });
              } else {
                checkIfDone();
              }
            }
          });
        }
      });
    });
    
    function checkIfDone() {
      tablesProcessed++;
      if (tablesProcessed === tables.length) {
        db.close();
      }
    }
  });
});

// Handle database close
db.on('close', () => {
  console.log('\n🔌 Database connection closed');
});
