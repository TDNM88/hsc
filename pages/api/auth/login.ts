import type { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"
import { z } from "zod"
import { login, createSession } from "@/lib/auth"
import { withRateLimit } from "@/lib/api-utils"

// Define login schema
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Validate request body
    const validatedData = loginSchema.safeParse(req.body)
    if (!validatedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: validatedData.error.errors,
      })
    }

    const { email, password } = validatedData.data
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "unknown"
    const userAgent = req.headers["user-agent"]

    // Authenticate user
    const result = await login({ email, password })

    if (!result.success || !result.user || !result.token) {
      return res.status(401).json({
        error: result.error || "Email/tên đăng nhập hoặc mật khẩu không đúng",
      })
    }

    // Create session with additional metadata
    await createSession(result.user.id, result.token, ipAddress, userAgent)

    // Set HTTP-only cookie
    const cookie = serialize("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    res.setHeader("Set-Cookie", cookie)

    // Prepare user data for response
    const userData = {
      id: result.user.id,
      email: result.user.email,
      username: result.user.username,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      balance: result.user.balance,
      isEmailVerified: result.user.isEmailVerified,
      kycStatus: result.user.kycStatus,
    }

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      error: "Lỗi server. Vui lòng thử lại sau.",
    })
  }
}

// Apply rate limiting
export default async function rateLimitedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    "auth-login",
    "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau."
  )
}
