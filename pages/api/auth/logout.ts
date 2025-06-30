import type { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"
import { verifyToken } from "@/lib/auth"
import { withRateLimit } from "@/lib/api-utils"
import { sql } from "@/lib/db"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get token from cookies
    const token = req.cookies["auth-token"] || ""
    
    if (token) {
      try {
        // Verify and decode the token to get user info
        const decoded = verifyToken(token)
        if (decoded && decoded.userId) {
          // Invalidate the session in the database
          await sql`
            DELETE FROM sessions 
            WHERE user_id = ${decoded.userId} AND token = ${token}
          `
        }
      } catch (error) {
        // Token is invalid or expired, but we'll still clear the cookie
        console.warn("Invalid or expired token during logout:", error)
      }
    }

    // Clear the auth cookie
    const cookie = serialize("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
    })

    res.setHeader("Set-Cookie", cookie)

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({
      success: false,
      error: "Lỗi server. Vui lòng thử lại sau.",
    })
  }
}

// Apply rate limiting
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    'auth-logout',
    'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
  )
}
