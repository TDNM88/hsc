import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { NextApiRequest, NextApiResponse } from "next"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: string
  email: string
  name: string | null
  username: string
  role: "user" | "admin"
  balance: string
  isVerified: boolean
  lastLogin: Date | null
}

export interface CreateUserData {
  email: string
  name?: string
  username: string
  password: string
  phone?: string
}

// Generate simple ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Set auth cookie
export function setAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  )
}

// Clear auth cookie
export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    `auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  )
}

// Get auth token from request
export function getAuthToken(req: NextApiRequest): string | null {
  return req.cookies["auth-token"] || null
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM neon_auth.users_sync 
      WHERE email = ${email} 
      LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking email:", error)
    return false
  }
}

// Check if username exists
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM neon_auth.user_profiles 
      WHERE username = ${username} 
      LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error("Error checking username:", error)
    return false
  }
}

// Create user
export async function createUser(userData: CreateUserData): Promise<User> {
  const { email, name, username, password, phone } = userData

  // Check if user already exists
  if (await emailExists(email)) {
    throw new Error("Email already exists")
  }

  if (await usernameExists(username)) {
    throw new Error("Username already exists")
  }

  // Hash password
  const passwordHash = await hashPassword(password)
  const userId = generateId()
  const profileId = generateId()

  try {
    // Create user in users_sync table
    await sql`
      INSERT INTO neon_auth.users_sync (id, email, name, created_at, updated_at)
      VALUES (${userId}, ${email}, ${name || username}, NOW(), NOW())
    `

    // Create user profile
    await sql`
      INSERT INTO neon_auth.user_profiles (
        id, user_id, username, password_hash, phone, balance, 
        role, is_verified, is_active, created_at, updated_at
      )
      VALUES (
        ${profileId}, ${userId}, ${username}, ${passwordHash}, ${phone || null}, 
        1000.00, 'user', true, true, NOW(), NOW()
      )
    `

    // Get complete user data
    const result = await sql`
      SELECT 
        u.id, u.email, u.name,
        up.username, up.role, up.balance, up.is_verified, up.last_login
      FROM neon_auth.users_sync u
      JOIN neon_auth.user_profiles up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `

    return {
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      username: result[0].username,
      role: result[0].role,
      balance: result[0].balance,
      isVerified: result[0].is_verified,
      lastLogin: result[0].last_login,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

// Authenticate user
export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  try {
    // Get user by email or username
    const result = await sql`
      SELECT 
        u.id, u.email, u.name,
        up.username, up.password_hash, up.role, up.balance, 
        up.is_verified, up.is_active, up.last_login
      FROM neon_auth.users_sync u
      JOIN neon_auth.user_profiles up ON u.id = up.user_id
      WHERE u.email = ${identifier} OR up.username = ${identifier}
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const userRecord = result[0]

    // Check if account is active
    if (!userRecord.is_active || !userRecord.is_verified) {
      return null
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userRecord.password_hash)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await sql`
      UPDATE neon_auth.user_profiles 
      SET last_login = NOW(), updated_at = NOW()
      WHERE user_id = ${userRecord.id}
    `

    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
      balance: userRecord.balance,
      isVerified: userRecord.is_verified,
      lastLogin: new Date(),
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const result = await sql`
      SELECT 
        u.id, u.email, u.name,
        up.username, up.role, up.balance, up.is_verified, up.last_login
      FROM neon_auth.users_sync u
      JOIN neon_auth.user_profiles up ON u.id = up.user_id
      WHERE u.id = ${decoded.userId} AND up.is_active = true
      LIMIT 1
    `

    if (result.length === 0) return null

    const userRecord = result[0]
    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
      balance: userRecord.balance,
      isVerified: userRecord.is_verified,
      lastLogin: userRecord.last_login,
    }
  } catch (error) {
    console.error("Get user from token error:", error)
    return null
  }
}

// Get current user from request
export async function getCurrentUser(req: NextApiRequest): Promise<User | null> {
  const token = getAuthToken(req)
  if (!token) return null
  return getUserFromToken(token)
}

// Rate limiting helper
export async function checkRateLimit(identifier: string, maxAttempts = 5, windowMinutes = 15): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

    const attempts = await sql`
      SELECT COUNT(*) as count
      FROM neon_auth.login_attempts
      WHERE ip_address = ${identifier} 
      AND created_at >= ${windowStart.toISOString()}
      AND success = false
    `

    return (attempts[0]?.count || 0) < maxAttempts
  } catch (error) {
    console.error("Error checking rate limit:", error)
    return true // Allow on error
  }
}

// Log login attempt
export async function logLoginAttempt(
  userId: string | null,
  ipAddress: string,
  userAgent: string | undefined,
  success: boolean,
) {
  try {
    await sql`
      INSERT INTO neon_auth.login_attempts (id, user_id, ip_address, user_agent, success, created_at)
      VALUES (${generateId()}, ${userId}, ${ipAddress}, ${userAgent || null}, ${success}, NOW())
    `
  } catch (error) {
    console.error("Error logging login attempt:", error)
  }
}
