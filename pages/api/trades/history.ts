import { NextApiRequest, NextApiResponse } from 'next';
import { getUserTrades } from '@/lib/trade';
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

    // Get user trades
    const { trades, total } = await getUserTrades(
      parseInt(session.user.id, 10),
      limitNumber,
      (pageNumber - 1) * limitNumber
    );

    return res.status(200).json({
      trades,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
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
  }, 'trades-history', 'Too many requests. Please try again later.');
}
