import { db } from './db';
import { transactions, users, type Transaction, type NewTransaction } from './schema';
import { eq, sql } from 'drizzle-orm';

export async function createTransaction(transactionData: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction | null> {
  try {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transactionData,
        status: 'PENDING',
        reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      })
      .returning();

    return newTransaction || null;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

export async function updateTransactionStatus(
  transactionId: number,
  status: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    await db
      .update(transactions)
      .set({
        status,
        metadata: JSON.stringify(metadata),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));

    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
}

export async function processDeposit(userId: number, amount: number, paymentMethod: string): Promise<Transaction | null> {
  try {
    // Start a transaction
    return await db.transaction(async (tx: any) => {
      // Create transaction record
      const transaction = await tx
        .insert(transactions)
        .values({
          userId,
          amount: amount.toString(),
          type: 'deposit',
          status: 'COMPLETED', // In a real app, this would be PENDING until payment is confirmed
          description: `Deposit via ${paymentMethod}`,
          reference: `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          metadata: JSON.stringify({ paymentMethod }), // Convert metadata to JSON string
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
        .then((res: Transaction[]) => res[0]);

      if (!transaction) throw new Error('Failed to create transaction');

      // Update user balance
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return transaction;
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return null;
  }
}

export async function processWithdrawal(userId: number, amount: number, paymentDetails: any): Promise<Transaction | null> {
  try {
    // Start a transaction
    return await db.transaction(async (tx: any) => {
      // Check if user has sufficient balance
      const [user] = await tx
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId));

      if (!user || Number(user.balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal transaction
      const transaction = await tx
        .insert(transactions)
        .values({
          userId,
          amount: amount.toString(),
          type: 'withdrawal',
          status: 'PENDING', // Requires manual approval
          description: 'Withdrawal request',
          reference: `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          metadata: JSON.stringify({ paymentDetails }), // Convert metadata to JSON string
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .then((res: Transaction[]) => res[0]);

      if (!transaction) throw new Error('Failed to create withdrawal transaction');

      // Lock the funds by deducting from available balance
      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return transaction;
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error; // Re-throw to be handled by the API route
  }
}

export async function getUserTransactions(
  userId: number,
  limit: number = 20,
  offset: number = 0
): Promise<{ transactions: Transaction[]; total: number }> {
  try {
    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt)
      .limit(limit)
      .offset(offset);

    return {
      transactions: userTransactions,
      total: Number(total?.count) || 0,
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return { transactions: [], total: 0 };
  }
}
