const { db } = require('../lib/db');
const { users } = require('../lib/schema');
const path = require('path');
const fs = require('fs');

async function testDbConnection() {
  console.log('=== DATABASE CONNECTION TEST ===');
  
  try {
    // 1. Check if database file exists
    const dbPath = path.resolve(process.cwd(), 'london.db');
    console.log(`\n1. Checking database file at: ${dbPath}`);
    
    const dbExists = fs.existsSync(dbPath);
    if (!dbExists) {
      console.error('❌ Database file does not exist');
      console.log('Please run database migrations first with: npm run migrate:sqlite');
      return;
    }
    console.log('✅ Database file exists');
    
    // 2. Test database connection
    console.log('\n2. Testing database connection...');
    try {
      await db.raw('SELECT 1 as test');
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    // 3. Check if users table exists
    console.log('\n3. Checking if users table exists...');
    try {
      const tableExists = await db.schema.hasTable('users');
      if (!tableExists) {
        console.error('❌ Users table does not exist');
        console.log('Please run database migrations first with: npm run migrate:sqlite');
        return;
      }
      console.log('✅ Users table exists');
    } catch (error) {
      console.error('❌ Error checking for users table:', error.message);
      return;
    }
    
    // 4. Check users table schema
    console.log('\n4. Checking users table schema...');
    try {
      const columns = await db('sqlite_master')
        .select('sql')
        .where({ type: 'table', name: 'users' });
      
      if (columns.length === 0) {
        console.error('❌ Could not retrieve users table schema');
        return;
      }
      
      console.log('✅ Users table schema:');
      console.log(columns[0].sql);
      
    } catch (error) {
      console.error('❌ Error retrieving users table schema:', error.message);
      return;
    }
    
    // 5. Test inserting a test user (will be rolled back)
    console.log('\n5. Testing user insertion (will be rolled back)...');
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      phone: '1234567890',
      password: 'hashed_password',
      is_verified: false,
      balance: 0,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    try {
      // Start a transaction to rollback the test insert
      await db.transaction(async (trx) => {
        try {
          const [userId] = await trx('users').insert(testUser);
          console.log('✅ Test user inserted successfully (will be rolled back)');
          
          // Verify the user was inserted
          const insertedUser = await trx('users').where({ id: userId }).first();
          if (insertedUser) {
            console.log('✅ Successfully retrieved test user');
            console.log('User ID:', insertedUser.id);
            console.log('Email:', insertedUser.email);
          } else {
            console.error('❌ Failed to retrieve inserted test user');
          }
          
          // Intentionally throw to trigger rollback
          throw new Error('Rolling back test transaction');
          
        } catch (error) {
          if (error.message === 'Rolling back test transaction') {
            console.log('✅ Transaction rolled back successfully');
            throw error; // Re-throw to complete rollback
          }
          throw error;
        }
      });
    } catch (error) {
      if (error.message !== 'Rolling back test transaction') {
        console.error('❌ Error testing user insertion:', error.message);
        return;
      }
    }
    
    // 6. List existing users (if any)
    console.log('\n6. Listing existing users...');
    try {
      const existingUsers = await db('users').select('id', 'email', 'username', 'created_at').limit(5);
      
      if (existingUsers.length === 0) {
        console.log('ℹ️ No users found in the database');
      } else {
        console.log(`✅ Found ${existingUsers.length} user(s):`);
        console.table(existingUsers);
      }
    } catch (error) {
      console.error('❌ Error listing users:', error.message);
      return;
    }
    
    console.log('\n✅ All database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  } finally {
    // Close the database connection
    await db.destroy();
    console.log('\nDatabase connection closed');
  }
}

// Run the test
testDbConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
