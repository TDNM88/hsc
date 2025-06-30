import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveTrades } from '@/lib/trade';
import { withRateLimit, requireAuth } from '@/lib/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get active trades
    const activeTrades = await getActiveTrades(parseInt(session.user.id, 10));

    return res.status(200).json({
      trades: activeTrades,
    });
  } catch (error) {
    console.error('Error fetching active trades:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
