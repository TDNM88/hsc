import { db } from "../lib/db"
import { users } from "../lib/schema"
import { hashPassword } from "../lib/auth"
import { sql } from "drizzle-orm"

async function createAdmin() {
  try {
    // Tạo dữ liệu admin với đầy đủ các trường bắt buộc theo schema
    const adminData = {
      username: "admin",
      email: "admin@londonssi.com",
      password: await hashPassword("admin123456"),
      firstName: "Administrator",
      lastName: "",
      phone: "0123456789",
      balance: sql`0.00`, // Sử dụng sql literal cho decimal
      role: "admin",
      status: "active",
      isEmailVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
      isLocked: false
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
