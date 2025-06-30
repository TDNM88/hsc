import type { NextApiRequest, NextApiResponse } from "next"
import { withRateLimit, requireRole } from "@/lib/api-utils"
import { db } from "@/lib/db"
import { transactions, users } from "@/lib/schema"
import { eq, desc, count, sql } from "drizzle-orm"

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === "GET") {
    try {
      const { type, page = "1", limit = "20" } = req.query
      const pageNumber = Number.parseInt(page as string, 10) || 1
      const limitNumber = Number.parseInt(limit as string, 10) || 20
      const offset = (pageNumber - 1) * limitNumber

      let whereCondition
      if (type === "deposits") {
        whereCondition = eq(transactions.type, "deposit")
      } else if (type === "withdrawals") {
        whereCondition = eq(transactions.type, "withdrawal")
      }

      const [transactionsList, totalCount] = await Promise.all([
        db
          .select({
            id: transactions.id,
            userId: transactions.userId,
            amount: transactions.amount,
            type: transactions.type,
            status: transactions.status,
            description: transactions.description,
            createdAt: transactions.createdAt,
            username: users.username,
            email: users.email,
          })
          .from(transactions)
          .leftJoin(users, eq(transactions.userId, users.id))
          .where(whereCondition)
          .orderBy(desc(transactions.createdAt))
          .limit(limitNumber)
          .offset(offset),

        db.select({ count: count() }).from(transactions).where(whereCondition),
      ])

      const formattedTransactions = transactionsList.map((transaction) => ({
        id: transaction.id.toString(),
        time: transaction.createdAt.toLocaleString("vi-VN"),
        user: transaction.username || transaction.email,
        amount: Number.parseFloat(transaction.amount),
        bank: "Vietcombank",
        status:
          transaction.status === "pending" ? "Chờ duyệt" : transaction.status === "completed" ? "Đã duyệt" : "Từ chối",
        type: transaction.type,
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
      console.error("Error fetching transactions:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  } else if (req.method === "PUT") {
    try {
      const { transactionId, action } = req.body

      let status
      if (action === "approve") {
        status = "completed"
      } else if (action === "reject") {
        status = "failed"
      } else {
        return res.status(400).json({ error: "Invalid action" })
      }

      // Get transaction details
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, Number.parseInt(transactionId)))
        .limit(1)

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" })
      }

      // Update transaction status
      await db
        .update(transactions)
        .set({ status, updatedAt: new Date() })
        .where(eq(transactions.id, Number.parseInt(transactionId)))

      // If approving a deposit, add to user balance
      if (status === "completed" && transaction.type === "deposit") {
        await db
          .update(users)
          .set({
            balance: sql`cast(balance as decimal) + ${transaction.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, transaction.userId))
      }

      // If rejecting a withdrawal, return money to user balance
      if (status === "failed" && transaction.type === "withdrawal") {
        await db
          .update(users)
          .set({
            balance: sql`cast(balance as decimal) + ${transaction.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, transaction.userId))
      }

      return res.status(200).json({ message: "Transaction updated successfully" })
    } catch (error) {
      console.error("Error updating transaction:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}

export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(
    req,
    res,
    async () => {
      const authedHandler = requireRole("admin")(handler)
      return authedHandler(req, res)
    },
    "admin-transactions",
    "Too many requests to admin transactions API.",
  )
}
