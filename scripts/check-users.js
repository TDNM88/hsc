const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(process.cwd(), 'london.db');

function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file does not exist at ${DB_PATH}`);
  }
  return new Database(DB_PATH, { readonly: false });
}

async function checkUserByEmail(email) {
  const db = getDb();
  try {
    console.log(`\n🔍 Checking for user with email: ${email}`);
    
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      console.log('❌ User not found');
      return null;
    }
    
    console.log('✅ User found in database:');
    console.log('- ID:', user.id);
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Is Verified:', user.is_verified);
    console.log('- Created At:', user.created_at);
    
    // Check password hash
    if (user.password) {
      console.log('\n🔑 Password hash found (first 20 chars):', user.password.substring(0, 20) + '...');
      console.log('Hash length:', user.password.length);
      console.log('Hash algorithm (likely):', user.password.startsWith('$2a$') ? 'bcrypt' : 'unknown');
    } else {
      console.log('\n⚠️ No password hash found for user');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

async function listAllUsers() {
  const db = getDb();
  try {
    console.log('\n👥 Listing all users:');
    const users = db.prepare('SELECT id, username, email, name, role, created_at FROM users').all();
    
    if (users.length === 0) {
      console.log('No users found in the database');
      return [];
    }
    
    console.table(users);
    return users;
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      await listAllUsers();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

// Export functions for use in other scripts
module.exports = {
  checkUserByEmail,
  listAllUsers
};
