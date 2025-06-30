import type { NextApiRequest, NextApiResponse } from "next"
import { validateSession } from "./auth"
import { rateLimit } from "./rate-limit"

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number
    username: string
    email: string
    role: string
    balance: string
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse, session: any) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies.token

      if (!token) {
        return res.status(401).json({ error: "No token provided" })
      }

      const user = await validateSession(token)
      if (!user) {
        return res.status(401).json({ error: "Invalid token" })
      }

      req.user = user
      return handler(req, res, { user })
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}

export function requireRole(role: string) {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse, session: any) => Promise<void>) => {
    return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse, session: any) => {
      if (req.user?.role !== role) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }
      return handler(req, res, session)
    })
  }
}

export function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: () => Promise<void>,
  key: string,
  message = "Too many requests",
) {
  return rateLimit(req, res, handler, key, message)
}
