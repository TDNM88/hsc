import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { transactions, users } from "@/lib/schema"
import { eq } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { amount, method } = req.body

    if (!amount || !method) {
      return res.status(400).json({ error: "Amount and method are required" })
    }

    if (amount < 50000) {
      return res.status(400).json({ error: "Minimum deposit amount is 50,000 VND" })
    }

    const userId = session.user.id

    // Get current user balance
    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const currentBalance = Number.parseFloat(user.balance)
    const newBalance = currentBalance + Number(amount)

    // Create deposit transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: "deposit",
        amount: amount.toString(),
        status: "pending",
        description: `Deposit via ${method}`,
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        currency: "VND", // Thêm trường currency theo schema
      })
      .returning()

    return res.status(201).json({
      message: "Deposit request created successfully",
      transaction: {
        id: transaction.id,
        amount: Number.parseFloat(transaction.amount),
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    })
  } catch (error) {
    console.error("Deposit error:", error)
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
    "transactions-deposit",
    "Too many deposit requests. Please try again later.",
  )
}
