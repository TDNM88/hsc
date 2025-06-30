import type { NextApiRequest, NextApiResponse } from "next"
import { withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import * as schema from "@/lib/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { getToken } from "next-auth/jwt"
import { z } from "zod"

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
  }
}

// Define password requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

// Define request schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ChangePasswordRequest = z.infer<typeof changePasswordSchema>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    })
  }

  try {
    // Get the user's session
    const token = await getToken({ req })
    if (!token?.sub) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      })
    }

    // Validate request body
    const validation = changePasswordSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const { currentPassword, newPassword } = validation.data
    const userId = parseInt(token.sub)

    // Get the user from the database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect',
        field: 'currentPassword'
      })
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password',
        field: 'newPassword'
      })
    }

    // Hash the new password with increased salt rounds
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
    const now = new Date().toISOString()

    // Update the user's password and reset any password reset tokens
    await db
      .update(schema.users)
      .set({ 
        password: hashedPassword,
        passwordChangedAt: now,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: now
      })
      .where(eq(schema.users.id, user.id))

    // Invalidate all user sessions except the current one
    await db
      .delete(schema.userSessions)
      .where(eq(schema.userSessions.userId, user.id))

    return res.status(200).json({ 
      success: true,
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred while changing password',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Apply rate limiting (5 attempts per 15 minutes)
export default async function rateLimitedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    'change-password',
    'Too many password change attempts. Please try again in 15 minutes.'
  )
}
