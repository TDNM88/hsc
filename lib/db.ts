import { getNeonClient, getDrizzleClient } from './neon-client';

// Tạo proxy cho SQL client để tránh lỗi "self is not defined"
export const sql = new Proxy({} as any, {
  get: (target, prop) => {
    // Nếu là template literal tag function
    if (prop === 'then' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
      return undefined;
    }
    
    if (typeof prop === 'symbol') {
      return undefined;
    }
    
    // Xử lý template literal tag function
    if (prop === 'call' || prop === 'apply') {
      return async function(thisArg: any, args: any[]) {
        const neonClient = await getNeonClient();
        return neonClient(...args);
      };
    }
    
    return async (...args: any[]) => {
      const neonClient = await getNeonClient();
      return neonClient[prop](...args);
    };
  },
  apply: async (target, thisArg, args) => {
    const neonClient = await getNeonClient();
    return neonClient(...args);
  }
});

// Tạo proxy cho Drizzle ORM instance
export const db = new Proxy({} as any, {
  get: (target, prop) => {
    if (prop === 'then' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
      return undefined;
    }
    
    if (typeof prop === 'symbol') {
      return undefined;
    }
    
    return async (...args: any[]) => {
      const drizzleClient = await getDrizzleClient();
      return drizzleClient[prop](...args);
    };
  }
});

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
