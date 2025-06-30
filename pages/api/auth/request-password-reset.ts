import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sql } from "@/lib/db";
import { withRateLimit } from "@/lib/api-utils";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Lỗi xác thực",
        details: result.error.errors,
      });
    }

    const { email } = result.data;

    // Check if user exists
    const user = await sql`
      SELECT id, email, username FROM users 
      WHERE email = ${email} AND status = 'active' LIMIT 1
    `;

    if (user.length === 0) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user[0].id}
    `;

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: "Đặt lại mật khẩu của bạn",
      html: `
        <div>
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ${user[0].username}.</p>
          <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0;">
            Đặt lại mật khẩu
          </a>
          <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
}

// Apply rate limiting
export default withRateLimit(
  handler,
  "auth-request-password-reset",
  "Quá nhiều yêu cầu. Vui lòng thử lại sau."
);
