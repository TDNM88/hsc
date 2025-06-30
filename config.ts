// config.ts
// Configuration for the application

type Config = {
  // Server configuration
  nodeEnv: 'development' | 'production' | 'test'
  port: number
  
  // Authentication
  nextAuthSecret: string
  nextAuthUrl: string
  jwtSecret: string
  
  // Database
  databaseUrl: string
  databaseType: 'postgres' | 'sqlite'
  sqlitePath?: string
  
  // Rate limiting
  rateLimitEnabled: boolean
  rateLimitPerMinute: number
  
  // Security
  loginAttemptsBeforeLockout: number
  lockoutDurationMinutes: number
}

// Default configuration for development
const defaultConfig: Config = {
  // Server
  nodeEnv: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Authentication
  nextAuthSecret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/london',
  databaseType: (process.env.DATABASE_TYPE || 'sqlite') as 'postgres' | 'sqlite',
  sqlitePath: process.env.SQLITE_PATH || 'london.db',
  
  // Rate limiting
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60', 10),
  
  // Security
  loginAttemptsBeforeLockout: parseInt(process.env.LOGIN_ATTEMPTS_BEFORE_LOCKOUT || '5', 10),
  lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15', 10),
}

// Validate required environment variables in production
if (defaultConfig.nodeEnv === 'production') {
  const requiredVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'DATABASE_URL']
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}

export const config = defaultConfig
