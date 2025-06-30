import type { NextApiRequest, NextApiResponse } from "next"
import { verifyToken, getUserById } from "@/lib/auth"
import { withRateLimit } from "@/lib/api-utils"

// Define the user data that will be exposed to the client
type SafeUserData = {
  id: number
  uuid: string
  email: string
  username: string
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
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed`
    })
  }

  try {
    const token = req.cookies["auth-token"]

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "No authentication token provided"
      })
    }

    // Verify token
    let decoded
    try {
      decoded = verifyToken(token)
      if (!decoded || !decoded.userId) {
        throw new Error("Invalid token")
      }
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid or expired authentication token"
      })
    }

    // Get user data
    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found"
      })
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: "Account is not active. Please contact support.",
        accountStatus: user.status
      })
    }

    // Create a safe user object without sensitive data
    const safeUser: SafeUserData = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
      phone: user.phone,
      balance: user.balance,
      currency: user.currency,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      kycStatus: user.kycStatus,
      twoFactorEnabled: user.twoFactorEnabled,
      referralCode: user.referralCode,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    
    return res.status(200).json({
      success: true,
      data: safeUser
    })
  } catch (error) {
    console.error("Get user error:", error)
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching user data"
    })
  }
}

// Apply rate limiting
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    'me',
    'Too many requests from this IP, please try again after 15 minutes'
  )
}
