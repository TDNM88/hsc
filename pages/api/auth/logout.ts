import type { NextApiRequest, NextApiResponse } from "next"
import { clearAuthCookie } from "../../../lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Clear auth cookie
    clearAuthCookie(res)

    res.status(200).json({
      message: "Đăng xuất thành công",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau." })
  }
}
