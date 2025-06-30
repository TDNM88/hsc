import type { NextApiRequest, NextApiResponse } from "next"
import { createUserSchema } from "../../../lib/schema"
import {
  createUser,
  emailExists,
  usernameExists,
  generateToken,
  setAuthCookie,
  checkRateLimit,
  logLoginAttempt,
} from "../../../lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const clientIp = (req.headers["x-forwarded-for"] as string) || req.connection.remoteAddress || "unknown"
  const userAgent = req.headers["user-agent"]

  try {
    // Check rate limiting
    const canProceed = await checkRateLimit(clientIp, 3, 15) // 3 attempts per 15 minutes
    if (!canProceed) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(429).json({
        error: "Quá nhiều lần thử đăng ký. Vui lòng thử lại sau 15 phút.",
      })
    }

    // Validate input
    const validation = createUserSchema.safeParse(req.body)
    if (!validation.success) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(400).json({
        error: "Dữ liệu không hợp lệ",
        details: validation.error.errors,
      })
    }

    const { email, username, password, name, phone } = validation.data

    // Check if email already exists
    if (await emailExists(email)) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(400).json({ error: "Email đã được sử dụng" })
    }

    // Check if username already exists
    if (await usernameExists(username)) {
      await logLoginAttempt(null, clientIp, userAgent, false)
      return res.status(400).json({ error: "Tên đăng nhập đã được sử dụng" })
    }

    // Create user
    const user = await createUser({
      email,
      name,
      username,
      password,
      phone,
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    // Set auth cookie
    setAuthCookie(res, token)

    // Log successful registration
    await logLoginAttempt(user.id, clientIp, userAgent, true)

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        balance: user.balance,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    await logLoginAttempt(null, clientIp, userAgent, false)

    if (error instanceof Error) {
      if (error.message === "Email already exists" || error.message === "Username already exists") {
        return res.status(400).json({ error: error.message })
      }
    }

    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau." })
  }
}
