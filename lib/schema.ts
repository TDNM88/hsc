import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Users table with comprehensive fields
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    fullName: varchar("full_name", { length: 200 }),
    phone: varchar("phone", { length: 20 }),
    dateOfBirth: timestamp("date_of_birth"),
    gender: varchar("gender", { length: 10 }),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 20 }),
    balance: decimal("balance", { precision: 15, scale: 2 }).default("1000.00").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    role: varchar("role", { length: 20 }).default("user").notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    isPhoneVerified: boolean("is_phone_verified").default(false).notNull(),
    kycStatus: varchar("kyc_status", { length: 20 }).default("pending").notNull(),
    kycLevel: integer("kyc_level").default(0).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    twoFactorSecret: varchar("two_factor_secret", { length: 32 }),
    referralCode: varchar("referral_code", { length: 20 }).unique(),
    referredBy: integer("referred_by").references(() => users.id),
    totalDeposits: decimal("total_deposits", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalWithdrawals: decimal("total_withdrawals", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalTrades: integer("total_trades").default(0).notNull(),
    winningTrades: integer("winning_trades").default(0).notNull(),
    losingTrades: integer("losing_trades").default(0).notNull(),
    winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalLoss: decimal("total_loss", { precision: 15, scale: 2 }).default("0.00").notNull(),
    lastLoginAt: timestamp("last_login_at"),
    lastLoginIp: varchar("last_login_ip", { length: 45 }),
    loginAttempts: integer("login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until"),
    preferences: jsonb("preferences").default({}),
    metadata: jsonb("metadata").default({}),
    avatar: varchar("avatar", { length: 500 }),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    language: varchar("language", { length: 10 }).default("en"),
    theme: varchar("theme", { length: 10 }).default("light"),
    notifications: jsonb("notifications").default({
      email: true,
      push: true,
      sms: false,
      trading: true,
      marketing: false,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    usernameIdx: index("users_username_idx").on(table.username),
    referralCodeIdx: index("users_referral_code_idx").on(table.referralCode),
    statusIdx: index("users_status_idx").on(table.status),
    kycStatusIdx: index("users_kyc_status_idx").on(table.kycStatus),
  }),
)

// Trading sessions table
export const tradingSessions = pgTable(
  "trading_sessions",
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    startPrice: decimal("start_price", { precision: 15, scale: 5 }).notNull(),
    endPrice: decimal("end_price", { precision: 15, scale: 5 }),
    direction: varchar("direction", { length: 10 }),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    totalTrades: integer("total_trades").default(0).notNull(),
    totalVolume: decimal("total_volume", { precision: 15, scale: 2 }).default("0.00").notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    symbolIdx: index("trading_sessions_symbol_idx").on(table.symbol),
    statusIdx: index("trading_sessions_status_idx").on(table.status),
    startTimeIdx: index("trading_sessions_start_time_idx").on(table.startTime),
  }),
)

// Trades table
export const trades = pgTable(
  "trades",
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    sessionId: integer("session_id")
      .references(() => tradingSessions.id)
      .notNull(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    direction: varchar("direction", { length: 10 }).notNull(),
    entryPrice: decimal("entry_price", { precision: 15, scale: 5 }).notNull(),
    exitPrice: decimal("exit_price", { precision: 15, scale: 5 }),
    payout: decimal("payout", { precision: 15, scale: 2 }),
    profit: decimal("profit", { precision: 15, scale: 2 }),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    result: varchar("result", { length: 10 }),
    expiryTime: timestamp("expiry_time").notNull(),
    placedAt: timestamp("placed_at").defaultNow().notNull(),
    settledAt: timestamp("settled_at"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("trades_user_id_idx").on(table.userId),
    sessionIdIdx: index("trades_session_id_idx").on(table.sessionId),
    symbolIdx: index("trades_symbol_idx").on(table.symbol),
    statusIdx: index("trades_status_idx").on(table.status),
    placedAtIdx: index("trades_placed_at_idx").on(table.placedAt),
  }),
)

// Transactions table
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    method: varchar("method", { length: 50 }),
    reference: varchar("reference", { length: 100 }).unique(),
    description: text("description"),
    balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
    balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    metadata: jsonb("metadata").default({}),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("transactions_user_id_idx").on(table.userId),
    typeIdx: index("transactions_type_idx").on(table.type),
    statusIdx: index("transactions_status_idx").on(table.status),
    referenceIdx: index("transactions_reference_idx").on(table.reference),
    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  }),
)

// User sessions table for authentication
export const userSessions = pgTable(
  "user_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    token: varchar("token", { length: 500 }).notNull().unique(),
    refreshToken: varchar("refresh_token", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index("user_sessions_token_idx").on(table.token),
    userIdIdx: index("user_sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
  }),
)

// KYC documents table
export const kycDocuments = pgTable(
  "kyc_documents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("kyc_documents_user_id_idx").on(table.userId),
    statusIdx: index("kyc_documents_status_idx").on(table.status),
  }),
)

// Referrals table
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    referrerId: integer("referrer_id")
      .references(() => users.id)
      .notNull(),
    referredId: integer("referred_id")
      .references(() => users.id)
      .notNull(),
    level: integer("level").default(1).notNull(),
    commission: decimal("commission", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).default("0.00").notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    referrerIdIdx: index("referrals_referrer_id_idx").on(table.referrerId),
    referredIdIdx: index("referrals_referred_id_idx").on(table.referredId),
  }),
)

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trades: many(trades),
  transactions: many(transactions),
  sessions: many(userSessions),
  kycDocuments: many(kycDocuments),
  referrals: many(referrals, { relationName: "referrer" }),
  referredUsers: many(referrals, { relationName: "referred" }),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}))

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  session: one(tradingSessions, {
    fields: [trades.sessionId],
    references: [tradingSessions.id],
  }),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}))

export const tradingSessionsRelations = relations(tradingSessions, ({ many }) => ({
  trades: many(trades),
}))

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}))

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycDocuments.reviewedBy],
    references: [users.id],
  }),
}))

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}))

// Export all tables
export const schema = {
  users,
  tradingSessions,
  trades,
  transactions,
  userSessions,
  kycDocuments,
  referrals,
}

export default schema
