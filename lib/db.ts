import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Simple database connection pool
export const dbPool = {
  query: sql,
  end: () => Promise.resolve(),
}

export const db = sql
