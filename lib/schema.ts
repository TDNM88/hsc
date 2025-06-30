import { pgTable, text, timestamp, decimal, boolean, integer, jsonb, pgEnum, index } from "drizzle-orm/pg-core"
import { z } from "zod"

// Re-export types for ES modules
export * from "drizzle-orm"

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"])
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "trade"])
export const tradeDirectionEnum = pgEnum("trade_direction", ["UP", "DOWN"])
export const tradeStatusEnum = pgEnum("trade_status", ["PENDING", "WON", "LOST", "CANCELED"])

// Users table (main user data)
export const users = pgTable(
  "users_sync",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    rawJson: jsonb("raw_json"),
  },
  (table) => ({
    emailIdx: index("users_sync_email_idx").on(table.email),
  }),
)

// User profiles table (authentication data)
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    phone: text("phone"),
    balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    isVerified: boolean("is_verified").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    loginAttempts: integer("login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: index("user_profiles_username_idx").on(table.username),
    userIdIdx: index("user_profiles_user_id_idx").on(table.userId),
  }),
)

// Login attempts table (security logging)
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    ipAddress: text("ip_address").notNull(),
    userAgent: text("user_agent"),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("login_attempts_user_id_idx").on(table.userId),
    ipAddressIdx: index("login_attempts_ip_address_idx").on(table.ipAddress),
    createdAtIdx: index("login_attempts_created_at_idx").on(table.createdAt),
  }),
)

// Transactions table
export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    status: text("status").default("PENDING").notNull(),
    description: text("description"),
    referenceId: text("reference_id").unique(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("transactions_user_id_idx").on(table.userId),
    statusIdx: index("transactions_status_idx").on(table.status),
  }),
)

// Rounds table
export const rounds = pgTable(
  "rounds",
  {
    id: text("id").primaryKey(),
    startPrice: decimal("start_price", { precision: 15, scale: 8 }),
    endPrice: decimal("end_price", { precision: 15, scale: 8 }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    status: text("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("rounds_status_idx").on(table.status),
    startTimeIdx: index("rounds_start_time_idx").on(table.startTime),
  }),
)

// Trades table
export const trades = pgTable(
  "trades",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roundId: text("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    direction: tradeDirectionEnum("direction").notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    entryPrice: decimal("entry_price", { precision: 15, scale: 8 }).notNull(),
    closePrice: decimal("close_price", { precision: 15, scale: 8 }),
    multiplier: decimal("multiplier", { precision: 5, scale: 2 }).default("1.95").notNull(),
    status: tradeStatusEnum("status").default("PENDING").notNull(),
    payout: decimal("payout", { precision: 15, scale: 2 }).default("0.00"),
    profit: decimal("profit", { precision: 15, scale: 2 }),
    result: text("result"),
    duration: integer("duration").notNull(),
    openTime: timestamp("open_time", { withTimezone: true }).defaultNow().notNull(),
    closeTime: timestamp("close_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("trades_user_id_idx").on(table.userId),
    roundIdIdx: index("trades_round_id_idx").on(table.roundId),
    statusIdx: index("trades_status_idx").on(table.status),
  }),
)

// API Keys table
export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("api_keys_user_id_idx").on(table.userId),
    keyIdx: index("api_keys_key_idx").on(table.key),
  }),
)

// Validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email hoặc tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phone: z.string().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export const depositWithdrawSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  method: z.string().min(1, "Vui lòng chọn phương thức"),
  transactionDetails: z.record(z.any()).optional(),
})

export const placeTradeSchema = z.object({
  symbol: z.string().min(1, "Vui lòng chọn cặp tiền tệ"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  direction: z.enum(["UP", "DOWN"], {
    errorMap: () => ({ message: "Vui lòng chọn hướng giao dịch" }),
  }),
  duration: z.number().positive("Thời gian giao dịch phải lớn hơn 0").optional().default(60),
})

// Enums for database
export const tradeDirectionEnumArray = ["UP", "DOWN"] as const
export const tradeStatusEnumArray = ["PENDING", "WON", "LOST", "CANCELED"] as const

export type TradeDirection = (typeof tradeDirectionEnumArray)[number]
export type TradeStatus = (typeof tradeStatusEnumArray)[number]

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type LoginAttempt = typeof loginAttempts.$inferSelect
export type NewLoginAttempt = typeof loginAttempts.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Round = typeof rounds.$inferSelect
export type NewRound = typeof rounds.$inferInsert
export type Trade = typeof trades.$inferSelect
export type NewTrade = typeof trades.$inferInsert
export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
