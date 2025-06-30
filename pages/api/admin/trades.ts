import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"
import { trades, users } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const allTrades = await db
      .select({
        id: trades.id,
        username: users.username,
        sessionId: trades.sessionId,
        direction: trades.direction,
        amount: trades.amount,
        profit: trades.profit,
        status: trades.status,
        createdAt: trades.createdAt,
      })
      .from(trades)
      .leftJoin(users, eq(trades.userId, users.id))
      .orderBy(desc(trades.createdAt))
      .limit(100)

    return res.status(200).json({
      trades: allTrades,
    })
  } catch (error) {
    console.error("Trades error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
