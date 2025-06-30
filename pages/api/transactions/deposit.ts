import { NextApiRequest, NextApiResponse } from 'next';
import { depositWithdrawSchema } from '@/lib/schema';
import { processDeposit } from '@/lib/transaction';
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

    const { amount, method } = validatedData.data;

    // Process deposit
    const result = await processDeposit(
      parseInt(session.user.id, 10),
      amount,
      method
    );
    
    if (!result) {
      return res.status(500).json({ error: 'Failed to process deposit' });
    }

    return res.status(200).json({
      message: 'Deposit request received',
      transaction: result
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Apply rate limiting and authentication
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    const authedHandler = requireAuth(handler);
    return authedHandler(req, res);
  }, 'transactions-deposit', 'Too many deposit requests. Please try again later.');
}
