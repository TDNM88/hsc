import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { trades } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const userId = session.user.id

    // Get active trades (pending status)
    const activeTrades = await db
      .select({
        id: trades.id,
        sessionId: trades.sessionId,
        direction: trades.direction,
        amount: trades.amount,
        status: trades.status,
        entryPrice: trades.entryPrice,
        expiryTime: trades.expiryTime,
        createdAt: trades.createdAt,
      })
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, "pending")))

    return res.status(200).json({
      trades: activeTrades.map((trade) => ({
        id: trade.id,
        sessionId: trade.sessionId,
        direction: trade.direction,
        amount: Number.parseFloat(trade.amount),
        entryPrice: Number.parseFloat(trade.entryPrice),
        expiryTime: trade.expiryTime?.toISOString(),
        status: trade.status,
        createdAt: trade.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching active trades:", error)
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(
    req,
    res,
    async () => {
      const authedHandler = requireAuth(handler)
      return authedHandler(req, res)
    },
    "trades-active",
    "Too many requests. Please try again later.",
  )
}
