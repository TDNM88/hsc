import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { config } from "../config"
import * as schema from "./schema"

// Create Neon serverless SQL client
export const sql = neon(config.database.url)

// Create Drizzle ORM instance with schema
export const db = drizzle(sql, { schema })

// Export SQL client for direct queries
export { sql as dbPool }

// Export schema types for type safety
export type Database = typeof db

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`
    return result.length > 0 && result[0].test === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}

// Database health check
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy"
  timestamp: string
  latency?: number
}> {
  const start = Date.now()

  try {
    await sql`SELECT 1`
    const latency = Date.now() - start

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      latency,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
    }
  }
}

// Execute raw SQL with error handling
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql`SELECT * FROM ${query}`
    return result as T[]
  } catch (error) {
    console.error("Query execution failed:", error)
    throw new Error(`Database query failed: ${error}`)
  }
}

// Transaction wrapper
export async function withTransaction<T>(callback: (tx: typeof sql) => Promise<T>): Promise<T> {
  try {
    return await callback(sql)
  } catch (error) {
    console.error("Transaction failed:", error)
    throw error
  }
}

// Database utilities
export const dbUtils = {
  // Get table row count
  async getRowCount(tableName: string): Promise<number> {
    const result = await sql`SELECT COUNT(*) as count FROM ${tableName}`
    return Number.parseInt(result[0].count)
  },

  // Check if table exists
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ) as exists
      `
      return result[0].exists
    } catch {
      return false
    }
  },

  // Get database version
  async getVersion(): Promise<string> {
    const result = await sql`SELECT version() as version`
    return result[0].version
  },

  // Get database size
  async getDatabaseSize(): Promise<string> {
    const result = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `
    return result[0].size
  },
}

export default db
