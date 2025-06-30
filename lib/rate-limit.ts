import type { NextApiRequest, NextApiResponse } from "next"

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: () => Promise<void>,
  key: string,
  message = "Too many requests",
): Promise<void> {
  const clientId = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown"
  const rateLimitKey = `${key}:${clientId}`

  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  const current = rateLimitMap.get(rateLimitKey)

  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now })
    return handler()
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: message })
  }

  current.count++
  return handler()
}
