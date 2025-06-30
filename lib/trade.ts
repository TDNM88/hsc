import { db } from './db';
import { trades, users, type Trade, type NewTrade } from './schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export async function placeTrade(
  userId: number,
  roundId: number,
  symbol: string,
  amount: number,
  direction: 'UP' | 'DOWN'
): Promise<Trade | null> {
  try {
    // Get current price from market data (in a real app, fetch from your market data source)
    const currentPrice = 0; // This should be replaced with actual market data
    
    return await db.transaction(async (tx: any) => {
      // Check user balance
      const [user] = await tx
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId));

      if (!user || Number(user.balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct trade amount from user balance
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Create trade
      const [trade] = await tx
        .insert(trades)
        .values({
          userId,
          roundId,
          symbol,
          amount: amount.toString(),
          direction,
          entryPrice: currentPrice.toString(),
          status: 'PENDING',
          openTime: new Date(),
        })
        .returning();

      if (!trade) throw new Error('Failed to create trade');

      return trade;
    });
  } catch (error) {
    console.error('Error placing trade:', error);
    throw error;
  }
}

export async function settleTrade(tradeId: number): Promise<boolean> {
  return await db.transaction(async (tx: any) => {
    // Get the trade with user info
    const [trade] = await tx
      .select()
      .from(trades)
      .where(eq(trades.id, tradeId));

    if (!trade || trade.status !== 'PENDING') {
      throw new Error('Invalid or already settled trade');
    }

    // Get current price (in a real app, fetch from your market data source)
    const currentPrice = 0; // This should be replaced with actual market data
    const entryPrice = parseFloat(trade.entryPrice);
    const amount = parseFloat(trade.amount);
    
    // Calculate trade result
    let status: 'WON' | 'LOST';
    let profit = 0;
    let result = '';

    if (currentPrice > entryPrice) {
      status = trade.direction === 'UP' ? 'WON' : 'LOST';
      result = `Price moved ${currentPrice > entryPrice ? 'up' : 'down'} from ${entryPrice} to ${currentPrice}`;
    } else if (currentPrice < entryPrice) {
      status = trade.direction === 'DOWN' ? 'WON' : 'LOST';
      result = `Price moved ${currentPrice > entryPrice ? 'up' : 'down'} from ${entryPrice} to ${currentPrice}`;
    } else {
      // Price didn't change, consider it a loss
      status = 'LOST';
      result = 'Price did not change';
    }

    // Calculate profit (80% of amount for winning trades, 0 for losing trades)
    if (status === 'WON') {
      profit = amount * 0.8; // 80% payout
      // Add winnings to user balance
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount + profit}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, trade.userId));
    }

    // Update trade with result
    await tx
      .update(trades)
      .set({
        status,
        closePrice: currentPrice.toString(),
        result,
        profit: profit.toString(),
        payout: status === 'WON' ? (amount + profit).toString() : '0',
        closeTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trades.id, tradeId));

    return true;
  });
}

export async function getUserTrades(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ trades: Trade[]; total: number }> {
  try {
    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trades)
      .where(eq(trades.userId, userId));

    const userTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.openTime))
      .limit(limit)
      .offset(offset);

    return {
      trades: userTrades,
      total: Number(total?.count) || 0,
    };
  } catch (error) {
    console.error('Error fetching user trades:', error);
    return { trades: [], total: 0 };
  }
}

export async function getActiveTrades(userId: number): Promise<Trade[]> {
  try {
    return await db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          eq(trades.status, 'PENDING')
        )
      )
      .orderBy(desc(trades.openTime));
  } catch (error) {
    console.error('Error fetching active trades:', error);
    return [];
  }
}
