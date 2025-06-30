import { db } from "../lib/db";
import { rounds, trades, users } from "../lib/schema";
import { and, eq, sql, desc } from "drizzle-orm";

// Định nghĩa các enum thay vì import từ schema
type TradeDirection = "UP" | "DOWN";
type TradeStatus = "PENDING" | "SETTLED" | "CANCELLED";
type TradeResult = "WON" | "LOST";

/**
 * Shared-round worker
 * – Creates a new 60-second round at the start of every minute (UTC)
 * – Settles all rounds whose endTime + grace ≤ now()
 */

const ROUND_LENGTH_MS = 60 * 1000; // 60 s
const GRACE_MS = 3 * 1000; // 3 s extra before settlement

async function ensureCurrentRound() {
  const now = Date.now();
  const startTimeMs = Math.floor(now / ROUND_LENGTH_MS) * ROUND_LENGTH_MS;
  const endTimeMs = startTimeMs + ROUND_LENGTH_MS;

  const [existing] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.startTime, new Date(startTimeMs)), eq(rounds.endTime, new Date(endTimeMs))));

  if (existing) return existing;

  const [created] = await db
    .insert(rounds)
    .values({ startTime: new Date(startTimeMs), endTime: new Date(endTimeMs) })
    .returning();

  return created;
}

async function settleDueRounds() {
  const now = new Date();
  // Chỉ lấy các rounds đã kết thúc nhưng chưa được xử lý (dựa vào endTime và isActive)
  const dueRounds = await db
    .select()
    .from(rounds)
    .where(and(
      eq(rounds.isActive, true),
      sql`(${rounds.endTime} + interval '3 seconds') <= ${now}`
    ));

  for (const round of dueRounds) {
    await settleRound(round.id);
  }
}

async function fetchMarketPrice(symbol: string): Promise<number> {
  // TODO: integrate real market price API
  return 0;
}

async function settleRound(roundId: number) {
  await db.transaction(async (tx: any) => {
    const [round] = await tx.select().from(rounds).where(eq(rounds.id, roundId));
    if (!round || !round.isActive) return; // Kiểm tra isActive thay vì status

    // For simplicity we use a generic symbol price; in production compute per symbol
    const closePrice = await fetchMarketPrice("BTCUSDT");

    await tx
      .update(rounds)
      .set({ 
        result: closePrice > 0, // Sử dụng trường result thay vì closePrice
        isActive: false, // Đánh dấu round đã được xử lý
        updatedAt: new Date() // Cập nhật thời gian thay vì settledAt
      })
      .where(eq(rounds.id, roundId));

    const roundTrades = await tx.select().from(trades).where(eq(trades.sessionId, roundId));

    for (const trade of roundTrades) {
      const entryPrice = parseFloat(trade.entryPrice);
      const amount = parseFloat(trade.amount);
      let status: "WON" | "LOST";
      let profit = 0;

      if (closePrice > entryPrice) {
        status = trade.direction === "UP" ? "WON" : "LOST";
      } else if (closePrice < entryPrice) {
        status = trade.direction === "DOWN" ? "WON" : "LOST";
      } else {
        status = "LOST";
      }

      if (status === "WON") {
        profit = amount * 0.8; // 80% payout
        await tx
          .update(users)
          .set({ balance: sql`${users.balance} + ${amount + profit}`, updatedAt: new Date() })
          .where(eq(users.id, trade.userId));
      }

      await tx
        .update(trades)
        .set({
          status,
          closePrice: closePrice.toString(),
          profit: profit.toString(),
          payout: status === "WON" ? (amount + profit).toString() : "0",
          closeTime: new Date(),
          result: closePrice > entryPrice ? "Price up" : closePrice < entryPrice ? "Price down" : "No change",
          updatedAt: new Date(),
        })
        .where(eq(trades.id, trade.id));
    }
  });
}

async function main() {
  await ensureCurrentRound(); // create the initial round if not exists

  // Every 5 seconds, ensure current round exists & settle due rounds
  setInterval(() => {
    ensureCurrentRound().catch(console.error);
    settleDueRounds().catch(console.error);
  }, 5000);
}

main().catch((err) => {
  console.error("Round worker failed", err);
  process.exit(1);
});
