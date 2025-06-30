import { NextApiRequest, NextApiResponse } from 'next';
import { getUserTransactions } from '@/lib/transaction';
import { withRateLimit, requireAuth } from '@/lib/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // Get query parameters
    const { page = '1', limit = '20' } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;
    const offset = (pageNumber - 1) * limitNumber;

    // Get transactions
    const { transactions, total } = await getUserTransactions(
      parseInt(session.user.id, 10),
      limitNumber,
      offset
    );

    return res.status(200).json({
      transactions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Apply rate limiting and authentication
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    const authedHandler = requireAuth(handler);
    return authedHandler(req, res);
  }, 'transactions-history', 'Too many requests. Please try again later.');
}
