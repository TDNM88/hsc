import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { trades, users, tradingSessions } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

// Định nghĩa kiểu dữ liệu cho transaction
type DrizzleTransaction = any

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

    // Tính toán thời gian hết hạn
    const EXPIRY_MS = 60_000 // 1 phút
    const now = Date.now()

    // Check if user has sufficient balance
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1)

    if (!user || Number.parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }

    // Lấy giá hiện tại (trong thực tế, bạn sẽ lấy từ API thị trường)
    const currentPrice = 1900.50; // Giả định giá hiện tại
    const expiryTime = new Date(Date.now() + 60 * 1000); // Hết hạn sau 1 phút
    
    // Create trade in transaction
    await db.transaction(async (tx: DrizzleTransaction) => {
      // Deduct amount from user balance
      await tx
        .update(users)
        .set({
          balance: sql`cast(balance as decimal) - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Tạo hoặc cập nhật phiên giao dịch
      const [session] = await tx
        .insert(tradingSessions)
        .values({
          userId,
          symbol,
          amount: amount.toString(),
          direction: direction.toLowerCase(),
          status: "active",
          totalTrades: 1,
          totalVolume: amount.toString(),
        })
        .returning({ id: tradingSessions.id });

      // Create trade record
      await tx.insert(trades).values({
        userId,
        sessionId: session.id,
        symbol,
        direction: direction.toLowerCase(),
        amount: amount.toString(),
        entryPrice: currentPrice.toString(),
        expiryTime,
        profit: "0",
        status: "pending",
      })
    })

    return res.status(201).json({
      message: "Trade placed successfully",
      success: true
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
