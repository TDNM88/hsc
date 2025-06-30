import { db } from "../lib/db"
import { trades, users } from "../lib/schema"
import { eq, sql } from "drizzle-orm"

// Định nghĩa kiểu dữ liệu cho transaction
type DrizzleTransaction = any

// Simple trade settlement script
async function settleTrades() {
  try {
    // Get all pending trades
    const pendingTrades = await db.select().from(trades).where(eq(trades.status, "pending"))

    console.log(`Found ${pendingTrades.length} pending trades`)

    for (const trade of pendingTrades) {
      // Simple random settlement for demo (in production, use real market data)
      const isWin = Math.random() > 0.5
      const profit = isWin ? Number.parseFloat(trade.amount) * 0.8 : -Number.parseFloat(trade.amount)
      const status = isWin ? "won" : "lost"

      await db.transaction(async (tx: DrizzleTransaction) => {
        // Update trade
        await tx
          .update(trades)
          .set({
            status,
            profit: profit.toString(),
            updatedAt: new Date(),
          })
          .where(eq(trades.id, trade.id))

        // If won, add winnings to user balance
        if (isWin) {
          const totalPayout = Number.parseFloat(trade.amount) + profit
          await tx
            .update(users)
            .set({
              balance: sql`cast(balance as decimal) + ${totalPayout}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, trade.userId))
        }
      })

      console.log(`Settled trade ${trade.id}: ${status}, profit: ${profit}`)
    }

    console.log("Trade settlement completed")
  } catch (error) {
    console.error("Error settling trades:", error)
  }
}

// Run settlement every 60 seconds
setInterval(settleTrades, 60000)
settleTrades() // Run immediately
