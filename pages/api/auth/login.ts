import type { NextApiRequest, NextApiResponse } from "next"
import { loginSchema } from "../../../lib/schema"
import { authenticateUser, generateToken, setAuthCookie, checkRateLimit, logLoginAttempt } from "../../../lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const clientIp = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress || "unknown"
  const userAgent = req.headers["user-agent"]

  try {
    // Check rate limiting
    const canProceed = await checkRateLimit(clientIp, 5, 15) // 5 attempts per 15 minutes
    if (!canProceed) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(429).json({
        error: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.",
      })
    }

    // Validate input
    const validation = loginSchema.safeParse(req.body)
    if (!validation.success) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: validation.error.errors,
      })
    }

    const { email, password } = validation.data

    // Authenticate user (email can also be username)
    const user = await authenticateUser(email, password)
    if (!user) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(401).json({ error: "Email/tên đăng nhập hoặc mật khẩu không đúng" })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    // Set auth cookie
    setAuthCookie(res, token)

    // Log successful login
    await logLoginAttempt(user.id, clientIp, userAgent, true)

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        balance: user.balance,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    await logLoginAttempt(null, clientIp, userAgent, false)
    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau." })
  }
}
