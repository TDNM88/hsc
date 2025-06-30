import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { transactions, users } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { amount, method, bankAccount, bankName } = req.body

    if (!amount || !method) {
      return res.status(400).json({ error: "Amount and method are required" })
    }

    if (amount < 100000) {
      return res.status(400).json({ error: "Minimum withdrawal amount is 100,000 VND" })
    }

    const userId = session.user.id

    // Check user balance
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1)

    if (!user || Number.parseFloat(user.balance) < amount) {
      return res.status(400).json({ error: "Insufficient balance" })
    }
    
    // Lưu số dư hiện tại để sử dụng trong giao dịch
    const currentBalance = Number.parseFloat(user.balance)
    const newBalance = currentBalance - Number(amount)

    // Create withdrawal transaction and deduct balance
    await db.transaction(async (tx) => {
      // Deduct amount from user balance
      await tx
        .update(users)
        .set({
          balance: sql`cast(balance as decimal) - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Create withdrawal transaction
      await tx.insert(transactions).values({
        userId,
        type: "withdrawal",
        amount: amount.toString(),
        status: "pending",
        description: `Withdrawal to ${bankName} - ${bankAccount}`,
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        currency: "VND", // Thêm trường currency theo schema
        fee: "0.00" // Thêm phí giao dịch (mặc định là 0)
      })
    })

    return res.status(201).json({
      message: "Withdrawal request created successfully",
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
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
    "transactions-withdraw",
    "Too many withdrawal requests. Please try again later.",
  )
}
