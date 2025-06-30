import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { register, emailExists, usernameExists } from "@/lib/auth"
import { withRateLimit } from "@/lib/api-utils"

// Define the registration schema
type RegisterInput = {
  email: string
  name: string
  username: string
  password: string
  phone?: string
}

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(1, "Tên là bắt buộc"),
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(20, "Tên đăng nhập không được vượt quá 20 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số"
    ),
  phone: z.string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, 
      "Số điện thoại không hợp lệ"
    )
    .optional()
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Validate request body
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: "Lỗi xác thực",
        details: result.error.errors,
      })
    }
    const validatedData = result.data

    const { email, name, username, password, phone } = validatedData

      // Check if email already exists
      const [emailExistsResult, usernameExistsResult] = await Promise.all([
        emailExists(email),
        usernameExists(username)
      ])

      if (emailExistsResult) {
        return res.status(400).json({
          error: "Email đã được sử dụng",
          field: "email"
        })
      }

      if (usernameExistsResult) {
        return res.status(400).json({
          error: "Tên đăng nhập đã được sử dụng",
          field: "username"
        })
      }

      // Create user
      const registerResult = await register({
        email: validatedData.email,
        firstName: validatedData.name.split(' ')[0],
        lastName: validatedData.name.split(' ').slice(1).join(' '),
        username: validatedData.username,
        password: validatedData.password,
        phone: validatedData.phone,
      });

      if (!registerResult.success) {
        return res.status(400).json({
          error: registerResult.error || "Đã xảy ra lỗi khi tạo tài khoản",
        });
      }

      // Return success response
      return res.status(201).json({
        message: "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.",
        user: registerResult.user,
        token: registerResult.token,
      });
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({
      error: "Lỗi server. Vui lòng thử lại sau.",
    })
  }
}

// Apply rate limiting
export default async function rateLimitedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return withRateLimit(
    req,
    res,
    () => handler(req, res),
    'auth-register',
    'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.'
  )
}
