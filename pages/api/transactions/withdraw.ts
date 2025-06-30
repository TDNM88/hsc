import { NextApiRequest, NextApiResponse } from 'next';
import { depositWithdrawSchema } from '@/lib/schema';
import { processWithdrawal } from '@/lib/transaction';
import { withRateLimit, requireAuth } from '@/lib/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // Validate request body
    const validatedData = depositWithdrawSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validatedData.error.errors,
      });
    }

    const { amount, method, transactionDetails } = validatedData.data;

    // Process withdrawal
    const result = await processWithdrawal(parseInt(session.user.id, 10), amount, {
      method,
      ...(transactionDetails || {}),
    });

    return res.status(200).json({
      message: 'Withdrawal request received',
      transaction: result
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
    return res.status(400).json({ 
      error: errorMessage,
      details: errorMessage,
    });
  }
}

// Apply rate limiting and authentication
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    const authedHandler = requireAuth(handler);
    return authedHandler(req, res);
  }, 'transactions-withdraw', 'Too many withdrawal requests. Please try again later.');
}
