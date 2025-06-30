// Application Configuration
export const config = {
  // App Info
  app: {
    name: process.env.APP_NAME || "HSCTrading Platform",
    version: process.env.APP_VERSION || "1.0.0",
    description: "Advanced Binary Options Trading Platform",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || "",
    poolSize: Number.parseInt(process.env.DB_POOL_SIZE || "10"),
    timeout: Number.parseInt(process.env.DB_TIMEOUT || "30000"),
  },

  // Redis
  redis: {
    url: process.env.KV_REST_API_URL || process.env.REDIS_URL || "",
    token: process.env.KV_REST_API_TOKEN || "",
    readOnlyToken: process.env.KV_REST_API_READ_ONLY_TOKEN || "",
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12"),
    sessionDuration: Number.parseInt(process.env.SESSION_DURATION || "604800"), // 7 days in seconds
  },

  // Rate Limiting
  rateLimit: {
    max: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"),
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
  },

  // Trading
  trading: {
    sessionDuration: Number.parseInt(process.env.TRADING_SESSION_DURATION || "300"), // 5 minutes
    profitPercentage: Number.parseFloat(process.env.PROFIT_PERCENTAGE || "85"),
    minTradeAmount: Number.parseFloat(process.env.MIN_TRADE_AMOUNT || "1"),
    maxTradeAmount: Number.parseFloat(process.env.MAX_TRADE_AMOUNT || "1000"),
    defaultBalance: Number.parseFloat(process.env.DEFAULT_BALANCE || "1000"),
  },

  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "noreply@ssitrading.com",
  },

  // File Upload
  upload: {
    maxSize: Number.parseInt(process.env.UPLOAD_MAX_SIZE || "5242880"), // 5MB
    allowedTypes: (process.env.ALLOW_FILE_TYPES || "image/jpeg,image/png,image/gif,application/pdf").split(","),
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },

  // Features
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== "false",
    enableKYC: process.env.ENABLE_KYC === "true",
    enableTwoFactor: process.env.ENABLE_TWO_FACTOR === "true",
    enableReferrals: process.env.ENABLE_REFERRALS === "true",
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== "false",
  },

  // API
  api: {
    baseUrl: process.env.API_BASE_URL || "/api",
    timeout: Number.parseInt(process.env.API_TIMEOUT || "30000"),
    retries: Number.parseInt(process.env.API_RETRIES || "3"),
  },

  // Security
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || "*").split(","),
    trustProxy: process.env.TRUST_PROXY === "true",
    rateLimitSkipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === "true",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
    file: process.env.LOG_FILE || "./logs/app.log",
  },

  // Environment
  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // External Services
  services: {
    tradingView: {
      enabled: true,
      widgetUrl: "https://s3.tradingview.com/tv.js",
      dataUrl: "https://widgetdata.tradingview.com",
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
      facebookPixelId: process.env.FACEBOOK_PIXEL_ID || "",
    },
  },

  // Pagination
  pagination: {
    defaultLimit: Number.parseInt(process.env.DEFAULT_PAGE_LIMIT || "20"),
    maxLimit: Number.parseInt(process.env.MAX_PAGE_LIMIT || "100"),
  },

  // Cache
  cache: {
    ttl: Number.parseInt(process.env.CACHE_TTL || "3600"), // 1 hour
    maxSize: Number.parseInt(process.env.CACHE_MAX_SIZE || "100"),
  },

  // Validation
  validation: {
    passwordMinLength: Number.parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
    usernameMinLength: Number.parseInt(process.env.USERNAME_MIN_LENGTH || "3"),
    usernameMaxLength: Number.parseInt(process.env.USERNAME_MAX_LENGTH || "20"),
  },

  // Referral System
  referral: {
    bonusPercentage: Number.parseFloat(process.env.REFERRAL_BONUS_PERCENTAGE || "10"),
    minWithdrawal: Number.parseFloat(process.env.REFERRAL_MIN_WITHDRAWAL || "50"),
    maxLevels: Number.parseInt(process.env.REFERRAL_MAX_LEVELS || "3"),
  },

  // KYC
  kyc: {
    requiredDocuments: ["id_front", "id_back", "proof_of_address"],
    maxFileSize: Number.parseInt(process.env.KYC_MAX_FILE_SIZE || "10485760"), // 10MB
    allowedFormats: ["jpg", "jpeg", "png", "pdf"],
  },

  // Two-Factor Authentication
  twoFactor: {
    issuer: process.env.TWO_FACTOR_ISSUER || "HSCTrading",
    window: Number.parseInt(process.env.TWO_FACTOR_WINDOW || "1"),
  },

  // Notifications
  notifications: {
    pushEnabled: process.env.PUSH_NOTIFICATIONS === "true",
    emailEnabled: process.env.EMAIL_NOTIFICATIONS !== "false",
    smsEnabled: process.env.SMS_NOTIFICATIONS === "true",
  },

  // Maintenance
  maintenance: {
    enabled: process.env.MAINTENANCE_MODE === "true",
    message: process.env.MAINTENANCE_MESSAGE || "System is under maintenance. Please try again later.",
    allowedIPs: (process.env.MAINTENANCE_ALLOWED_IPS || "").split(",").filter(Boolean),
  },
}

// Helper functions
export function getConfig(key: string, defaultValue?: any): any {
  const keys = key.split(".")
  let value: any = config

  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) break
  }

  return value !== undefined ? value : defaultValue
}

export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature] === true
}

export function isDevelopment(): boolean {
  return config.env.isDevelopment
}

export function isProduction(): boolean {
  return config.env.isProduction
}

export function isTest(): boolean {
  return config.env.isTest
}

export default config
