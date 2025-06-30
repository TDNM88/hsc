import { sql } from "../lib/db"
import { readFileSync } from "fs"
import { join } from "path"

async function deployDatabase() {
  try {
    console.log("🚀 Starting database deployment...")

    // Read and execute schema
    const schemaPath = join(process.cwd(), "scripts", "deploy-schema.sql")
    const schema = readFileSync(schemaPath, "utf8")

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const statement of statements) {
      try {
        await sql([statement] as any)
        console.log("✅ Executed:", statement.substring(0, 50) + "...")
      } catch (error) {
        console.error("❌ Error executing:", statement.substring(0, 50) + "...")
        console.error(error)
      }
    }

    console.log("🎉 Database deployment completed!")
  } catch (error) {
    console.error("💥 Database deployment failed:", error)
    process.exit(1)
  }
}

// Run deployment
deployDatabase()
