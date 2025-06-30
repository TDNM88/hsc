import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { trades, users } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { symbol, amount, direction } = req.body

    // Validation
    if (!symbol || !amount || !direction) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    if (amount < 100000) {
      return res.status(400).json({ error: "Minimum trade amount is 100,000 VND" })
    }

    if (!["up", "down"].includes(direction.toLowerCase())) {
      return res.status(400).json({ error: "Direction must be up or down" })
    }

    const userId = session.user.id

    // Get current round
    const ROUND_MS = 60_000
    const now = Date.now()
    const start = Math.floor(now / ROUND_MS) * ROUND_MS
    const roundId = Math.floor(start / 1000).toString()

    // Check if user has sufficient balance
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1)

    if (!user || Number.parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }

    // Create trade in transaction
    await db.transaction(async (tx) => {
      // Deduct amount from user balance
      await tx
        .update(users)
        .set({
          balance: sql`cast(balance as decimal) - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Create trade record
      await tx.insert(trades).values({
        userId,
        roundId,
        direction: direction.toLowerCase(),
        amount: amount.toString(),
        profit: "0",
        status: "pending",
      })
    })

    return res.status(201).json({
      message: "Trade placed successfully",
      roundId,
    })
  } catch (error) {
    console.error("Trade placement error:", error)
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
    "trades-place",
    "Too many trade requests. Please try again later.",
  )
}
