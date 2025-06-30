import type { NextApiRequest, NextApiResponse } from "next"
import { getCurrentUser } from "../../../lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = await getCurrentUser(req)

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        balance: user.balance,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau." })
  }
}
