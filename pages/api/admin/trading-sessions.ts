import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get current round
    const ROUND_MS = 60_000 // 60-second rounds
    const now = Date.now()
    const start = Math.floor(now / ROUND_MS) * ROUND_MS
    const end = start + ROUND_MS
    const roundId = Math.floor(start / 1000).toString()

    // Generate deterministic result based on round ID
    const result = Number.parseInt(roundId) % 2 === 0 ? "Lên" : "Xuống"

    const currentSession = {
      roundId,
      result,
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
    }

    // Generate 30 sessions for history
    const sessions = []
    const baseRoundId = Number.parseInt(roundId)

    for (let i = 1; i <= 30; i++) {
      const sessionRoundId = (baseRoundId - i).toString()
      const sessionStart = start - i * ROUND_MS
      const sessionEnd = sessionStart + ROUND_MS
      const sessionResult = Number.parseInt(sessionRoundId) % 2 === 0 ? "Lên" : "Xuống"

      sessions.push({
        roundId: sessionRoundId,
        result: sessionResult,
        startTime: new Date(sessionStart).toISOString(),
        endTime: new Date(sessionEnd).toISOString(),
      })
    }

    return res.status(200).json({
      currentSession,
      sessions,
    })
  } catch (error) {
    console.error("Trading sessions error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
