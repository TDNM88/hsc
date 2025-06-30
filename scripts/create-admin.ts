import { db } from "../lib/db"
import { users } from "../lib/schema"
import { hashPassword } from "../lib/auth"

async function createAdmin() {
  try {
    const adminData = {
      username: "admin",
      email: "admin@londonssi.com",
      passwordHash: await hashPassword("admin123456"),
      name: "Administrator",
      phone: "0123456789",
      balance: "0",
      role: "admin",
      isActive: true,
    }

    const [admin] = await db.insert(users).values(adminData).returning()

    console.log("Admin user created successfully:", {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    })

    console.log("\nLogin credentials:")
    console.log("Email: admin@londonssi.com")
    console.log("Password: admin123456")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

createAdmin()
