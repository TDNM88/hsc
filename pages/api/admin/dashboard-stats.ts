import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"
import { users, transactions, trades } from "@/lib/schema"
import { eq, desc, count, sum, gte } from "drizzle-orm"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get date range (last 30 days by default)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get stats
    const [newAccountsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))

    const [totalDepositsResult] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.type, "deposit"))

    const [totalWithdrawalsResult] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.type, "withdrawal"))

    const [totalBalanceResult] = await db.select({ total: sum(users.balance) }).from(users)

    // Get recent orders
    const recentOrders = await db
      .select({
        id: trades.id,
        username: users.username,
        sessionId: trades.sessionId,
        direction: trades.direction,
        amount: trades.amount,
        profit: trades.profit,
        createdAt: trades.createdAt,
      })
      .from(trades)
      .leftJoin(users, eq(trades.userId, users.id))
      .orderBy(desc(trades.createdAt))
      .limit(10)

    // Get new users
    const newUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        balance: users.balance,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .orderBy(desc(users.createdAt))
      .limit(10)

    const stats = {
      newAccounts: newAccountsResult.count || 0,
      totalDeposits: totalDepositsResult.total ? Number.parseFloat(totalDepositsResult.total) : 0,
      totalWithdrawals: totalWithdrawalsResult.total ? Number.parseFloat(totalWithdrawalsResult.total) : 0,
      totalBalance: totalBalanceResult.total ? Number.parseFloat(totalBalanceResult.total) : 0,
    }

    return res.status(200).json({
      stats,
      recentOrders: recentOrders.map((order) => ({
        ...order,
        amount: order.amount ? Number.parseFloat(order.amount) : 0,
        profit: order.profit ? Number.parseFloat(order.profit) : 0,
      })),
      newUsers,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
