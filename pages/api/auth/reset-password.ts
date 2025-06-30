import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sql } from "@/lib/db";
import { withRateLimit } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

const resetSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số"
    ),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const result = resetSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Lỗi xác thực",
        details: result.error.errors,
      });
    }

    const { token, password } = result.data;

    // Find user with valid reset token
    const user = await sql`
      SELECT id, reset_token_expiry 
      FROM users 
      WHERE reset_token = ${token} 
        AND reset_token_expiry > NOW()
      LIMIT 1
    `;

    if (user.length === 0) {
      return res.status(400).json({
        error: "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    // Update user password and clear reset token
    await sql`
      UPDATE users 
      SET 
        password = ${hashedPassword},
        password_changed_at = ${now},
        reset_token = NULL,
        reset_token_expiry = NULL
      WHERE id = ${user[0].id}
    `;

    // Invalidate all existing sessions
    await sql`
      DELETE FROM sessions 
      WHERE user_id = ${user[0].id}
    `;

    return res.status(200).json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
}

// Apply rate limiting
export default function rateLimitedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    "auth-reset-password",
    "Quá nhiều yêu cầu. Vui lòng thử lại sau."
  );
}
