import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

async function testAuthSystem() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log("🧪 Testing authentication system...")

    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    console.log(`✅ Database connected at: ${result[0].current_time}`)

    // Check if all required tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users_sync', 'user_profiles', 'login_attempts', 'verification_tokens', 'password_reset_tokens')
      ORDER BY table_name
    `

    console.log("📋 Required tables status:")
    const requiredTables = [
      "users_sync",
      "user_profiles",
      "login_attempts",
      "verification_tokens",
      "password_reset_tokens",
    ]
    const existingTables = tables.map((t: any) => t.table_name)

    requiredTables.forEach((table) => {
      const exists = existingTables.includes(table)
      console.log(`  ${exists ? "✅" : "❌"} ${table}`)
    })

    // Check users_sync structure
    const usersSyncColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_sync'
    `

    console.log("👤 users_sync columns:", usersSyncColumns)

    // Test if we can query users
    const userCount = await sql`SELECT COUNT(*) as count FROM users_sync`
    console.log(`📊 Total users: ${userCount[0].count}`)

    // Test user creation flow (simulation)
    console.log("\n🔐 Testing user registration flow...")

    const testUserId = crypto.randomUUID()
    const testEmail = `test-${Date.now()}@example.com`

    // Insert test user
    await sql`
      INSERT INTO users_sync (id, email, name, raw_json)
      VALUES (${testUserId}, ${testEmail}, 'Test User', '{"test": true}')
    `

    // Insert user profile
    await sql`
      INSERT INTO user_profiles (id, user_id, username, password, balance, role)
      VALUES (${crypto.randomUUID()}, ${testUserId}, 'testuser', 'hashed_password', 1000.00, 'user')
    `

    console.log("✅ Test user created successfully")

    // Verify user exists
    const userCheck = await sql`
      SELECT u.email, up.username, up.balance 
      FROM users_sync u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${testUserId}
    `

    if (userCheck.length > 0) {
      console.log(`✅ User verification successful: ${userCheck[0].email} (${userCheck[0].username})`)
    }

    // Clean up test user
    await sql`DELETE FROM user_profiles WHERE user_id = ${testUserId}`
    await sql`DELETE FROM users_sync WHERE id = ${testUserId}`
    console.log("🧹 Test data cleaned up")

    console.log("\n🎉 Authentication system test completed successfully!")
  } catch (error) {
    console.error("❌ Authentication system test failed:", error)
    process.exit(1)
  }
}

testAuthSystem()
