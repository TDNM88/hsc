import { NextApiRequest, NextApiResponse } from 'next';


/**
 * GET /api/rounds/current
 * Trả về phiên (round) đang mở cùng thời gian server.
 * Không yêu cầu xác thực – tất cả client cần đồng bộ đếm ngược.
 * Response:
 * {
 *   roundId: number;
 *   startTime: string; // ISO
 *   endTime:   string; // ISO
 *   serverTime: string; // ISO – phía client dùng để bù trừ latency
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ROUND_MS = 60_000; // 60-second rounds
    const now = Date.now();
    const start = Math.floor(now / ROUND_MS) * ROUND_MS;
    const end = start + ROUND_MS;

    return res.status(200).json({
      roundId: Math.floor(start / 1000),
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error computing current round:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
