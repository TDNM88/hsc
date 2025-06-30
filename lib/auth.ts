import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql } from "./db"
import { config } from "../config"
import type { NextApiRequest, NextApiResponse } from "next"

export interface User {
  id: number
  uuid: string
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  fullName?: string
  phone?: string
  balance: string
  currency: string
  role: string
  status: string
  isVerified: boolean
  isEmailVerified: boolean
  kycStatus: string
  twoFactorEnabled: boolean
  referralCode?: string
  avatar?: string
  preferences: any
  createdAt: string
  updatedAt: string
  passwordChangedAt?: string
  passwordResetToken?: string | null
  passwordResetExpires?: string | null
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
  message?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  referralCode?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.auth.bcryptRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: object | string | Buffer): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  } as jwt.SignOptions)
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.auth.jwtSecret)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

// Generate referral code
export function generateReferralCode(username: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${username.substring(0, 4).toUpperCase()}${timestamp}${random}`.substring(0, 12)
}

// Register new user
export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${data.email} OR username = ${data.username}
    `

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "User with this email or username already exists",
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Generate referral code
    const referralCode = generateReferralCode(data.username)

    // Handle referral
    let referredBy = null
    if (data.referralCode) {
      const referrer = await sql`
        SELECT id FROM users WHERE referral_code = ${data.referralCode}
      `
      if (referrer.length > 0) {
        referredBy = referrer[0].id
      }
    }

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        username, email, password, first_name, last_name, 
        full_name, phone, referral_code, referred_by,
        balance, currency, role, status, is_verified, 
        is_email_verified, kyc_status, two_factor_enabled
      ) VALUES (
        ${data.username}, ${data.email}, ${hashedPassword}, 
        ${data.firstName || null}, ${data.lastName || null},
        ${data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null},
        ${data.phone || null}, ${referralCode}, ${referredBy},
        ${config.trading.defaultBalance}, 'USD', 'user', 'active', 
        false, false, 'pending', false
      ) RETURNING *
    `

    if (newUser.length === 0) {
      return {
        success: false,
        error: "Failed to create user",
      }
    }

    const user = newUser[0] as User

    // Create referral record if referred
    if (referredBy) {
      await sql`
        INSERT INTO referrals (referrer_id, referred_id, level, status)
        VALUES (${referredBy}, ${user.id}, 1, 'active')
      `
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await createSession(user.id, token)

    return {
      success: true,
      user,
      token,
      message: "Registration successful",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Registration failed",
    }
  }
}

// Login user
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // Find user by email
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${credentials.email} AND deleted_at IS NULL
    `

    if (users.length === 0) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    const user = users[0] as User

    // Check if account is locked
    if (user.status === "locked") {
      return {
        success: false,
        error: "Account is locked. Please contact support.",
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password)

    if (!isValidPassword) {
      // Increment login attempts
      await sql`
        UPDATE users 
        SET login_attempts = login_attempts + 1,
            updated_at = NOW()
        WHERE id = ${user.id}
      `

      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Reset login attempts and update last login
    await sql`
      UPDATE users 
      SET login_attempts = 0,
          last_login_at = NOW(),
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    await createSession(user.id, token)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as User,
      token,
      message: "Login successful",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Login failed",
    }
  }
}

// Create user session
export async function createSession(
  userId: number,
  token: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setTime(expiresAt.getTime() + config.auth.sessionDuration * 1000)

  await sql`
    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (${userId}, ${token}, ${ipAddress || null}, ${userAgent || null}, ${expiresAt.toISOString()})
  `
}

// Validate session
export async function validateSession(token: string): Promise<User | null> {
  try {
    // Verify JWT token
    const decoded = verifyToken(token)

    // Check session in database
    const sessions = await sql`
      SELECT us.*, u.* FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.token = ${token} 
        AND us.is_active = true 
        AND us.expires_at > NOW()
        AND u.deleted_at IS NULL
    `

    if (sessions.length === 0) {
      return null
    }

    const session = sessions[0]
    const { password, ...user } = session

    return user as User
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

// Logout user
export async function logout(token: string): Promise<boolean> {
  try {
    await sql`
      UPDATE user_sessions 
      SET is_active = false, updated_at = NOW()
      WHERE token = ${token}
    `
    return true
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

// Change password
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> {
  try {
    // Get current user
    const users = await sql`
      SELECT password FROM users WHERE id = ${userId}
    `

    if (users.length === 0) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, users[0].password)

    if (!isValidPassword) {
      return {
        success: false,
        error: "Current password is incorrect",
      }
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await sql`
      UPDATE users 
      SET password = ${hashedNewPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `

    // Invalidate all sessions for security
    await sql`
      UPDATE user_sessions 
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${userId}
    `

    return {
      success: true,
      message: "Password changed successfully",
    }
  } catch (error) {
    console.error("Change password error:", error)
    return {
      success: false,
      error: "Failed to change password",
    }
  }
}

// Get user by ID
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const users = await sql`
      SELECT * FROM users 
      WHERE id = ${userId} AND deleted_at IS NULL
    `

    if (users.length === 0) {
      return null
    }

    const { password, ...user } = users[0]
    return user as User
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

// Middleware to protect routes
export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.token

      if (!token) {
        return res.status(401).json({ error: "No token provided" })
      }

      const user = await validateSession(token)

      if (!user) {
        return res.status(401).json({ error: "Invalid or expired token" })
      }

      return handler(req, res, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(500).json({ error: "Authentication failed" })
    }
  }
}

// Middleware to check admin role
export function withAdminAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return withAuth(async (req, res, user) => {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }
    return handler(req, res, user)
  })
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  try {
    await sql`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW() OR is_active = false
    `
  } catch (error) {
    console.error("Clean expired sessions error:", error)
  }
}

// Check if email already exists
export async function emailExists(email: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM users 
    WHERE email = ${email} 
    AND deleted_at IS NULL
    LIMIT 1
  `
  return result.length > 0
}

// Check if username already exists
export async function usernameExists(username: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM users 
    WHERE username = ${username} 
    AND deleted_at IS NULL
    LIMIT 1
  `
  return result.length > 0
}

export default {
  register,
  login,
  logout,
  changePassword,
  validateSession,
  getUserById,
  withAuth,
  withAdminAuth,
  cleanExpiredSessions,
}
