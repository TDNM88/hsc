import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, withRateLimit } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { transactions } from "@/lib/schema"
import { eq, desc, count, and } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { page = "1", limit = "20", type } = req.query
    const pageNumber = Number.parseInt(page as string, 10) || 1
    const limitNumber = Number.parseInt(limit as string, 10) || 20
    const offset = (pageNumber - 1) * limitNumber

    const userId = session.user.id

    let whereCondition = eq(transactions.userId, userId)
    if (type && (type === "deposit" || type === "withdrawal")) {
      whereCondition = and(whereCondition, eq(transactions.type, type as string))
    }

    // Get user transactions with pagination
    const [userTransactions, totalCount] = await Promise.all([
      db
        .select({
          id: transactions.id,
          type: transactions.type,
          amount: transactions.amount,
          status: transactions.status,
          description: transactions.description,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .where(whereCondition)
        .orderBy(desc(transactions.createdAt))
        .limit(limitNumber)
        .offset(offset),

      db.select({ count: count() }).from(transactions).where(whereCondition),
    ])

    const formattedTransactions = userTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number.parseFloat(transaction.amount),
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
    }))

    return res.status(200).json({
      transactions: formattedTransactions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limitNumber),
      },
    })
  } catch (error) {
    console.error("Error fetching transaction history:", error)
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
    "transactions-history",
    "Too many requests. Please try again later.",
  )
}
