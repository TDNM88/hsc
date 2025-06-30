import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

// Test user data
const testUser = {
  email: `test_${Math.random().toString(36).substring(2, 10)}@example.com`,
  username: `testuser_${Math.random().toString(36).substring(2, 10)}`,
  password: 'Test@1234',
  name: 'Test User',
  phone: '1234567890',
};

async function testRegistration() {
  console.log('=== Starting Registration Test ===');
  console.log('Test user:', testUser);

  try {
    // 1. Check if users table exists
    console.log('\n1. Checking if users table exists...');
    const tableCheck = await db.execute(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
    );
    
    if (tableCheck.rows.length === 0) {
      console.error('❌ Users table does not exist. Please run migrations first.');
      return;
    }
    console.log('✅ Users table exists');

    // 2. Test database connection
    console.log('\n2. Testing database connection...');
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    console.log('Connection test result:', connectionTest.rows);

    // 3. Test user insertion
    console.log('\n3. Testing user insertion...');
    const now = new Date().toISOString();
    const insertResult = await db.execute(
      sql`INSERT INTO users (email, username, password, name, phone, is_verified, balance, role, created_at, updated_at)
          VALUES (${testUser.email}, ${testUser.username}, 'hashed_password', ${testUser.name}, 
                 ${testUser.phone}, 0, '0', 'user', ${now}, ${now})
          RETURNING id, email, username`
    );
    
    const insertedUser = insertResult.rows[0];
    console.log('✅ User inserted successfully');
    console.log('Inserted user:', insertedUser);

    // 4. Verify user exists
    console.log('\n4. Verifying user exists in database...');
    const userCheck = await db.execute(
      sql`SELECT id, email, username, is_verified FROM users WHERE id = ${insertedUser.id}`
    );
    
    if (userCheck.rows.length === 0) {
      console.error('❌ Failed to retrieve inserted user');
      return;
    }
    
    console.log('✅ User verified in database');
    console.log('Retrieved user:', userCheck.rows[0]);
    
    // 5. Clean up (delete test user)
    console.log('\n5. Cleaning up test data...');
    await db.execute(sql`DELETE FROM users WHERE id = ${insertedUser.id}`);
    console.log('✅ Test user deleted');
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close the database connection
    await db.destroy();
    console.log('\nDatabase connection closed');  
  }
}

// Run the test
testRegistration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
