import { createUser } from "../lib/auth"

async function createTestUsers() {
  try {
    console.log("👤 Creating test users...")

    // Create admin user
    try {
      const adminUser = await createUser({
        email: "admin@londonssi.com",
        name: "Admin User",
        username: "admin",
        password: "admin123456",
        phone: "+84123456789",
      })

      // Update to admin role
      const { sql } = await import("../lib/db")
      await sql`
        UPDATE neon_auth.user_profiles 
        SET role = 'admin', balance = 10000.00 
        WHERE user_id = ${adminUser.id}
      `

      console.log("✅ Admin user created:")
      console.log("   Email: admin@londonssi.com")
      console.log("   Username: admin")
      console.log("   Password: admin123456")
      console.log("   Balance: $10,000")
    } catch (error) {
      console.log("ℹ️  Admin user already exists or error:", error)
    }

    // Create regular user
    try {
      const regularUser = await createUser({
        email: "user@londonssi.com",
        name: "Test User",
        username: "testuser",
        password: "user123456",
        phone: "+84987654321",
      })

      console.log("✅ Regular user created:")
      console.log("   Email: user@londonssi.com")
      console.log("   Username: testuser")
      console.log("   Password: user123456")
      console.log("   Balance: $1,000")
    } catch (error) {
      console.log("ℹ️  Regular user already exists or error:", error)
    }

    console.log("🎉 Test users creation completed!")
  } catch (error) {
    console.error("💥 Test users creation failed:", error)
    process.exit(1)
  }
}

// Run creation
createTestUsers()
