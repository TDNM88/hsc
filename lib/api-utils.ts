import type { NextApiRequest, NextApiResponse } from "next"
import { verifyToken } from "./auth"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  key: string,
  message = "Too many requests",
  limit = 10,
  windowMs = 60000, // 1 minute
) {
  const identifier = `${key}:${req.socket.remoteAddress || "unknown"}`
  const now = Date.now()

  const current = rateLimitStore.get(identifier)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return handler(req, res)
  }

  if (current.count >= limit) {
    return res.status(429).json({ error: message })
  }

  current.count++
  return handler(req, res)
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, session: any) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.cookies["auth-token"]

      if (!token) {
        return res.status(401).json({ error: "Authentication required" })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" })
      }

      const session = {
        user: {
          id: decoded.userId,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
        },
      }

      return handler(req, res, session)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}
