import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL)

// Create Drizzle database instance with schema
export const db = drizzle(sql, { schema })

// Export SQL client for raw queries
export { sql }

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("✅ Database connected successfully at:", result[0]?.current_time)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export default db
