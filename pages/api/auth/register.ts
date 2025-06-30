import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { withRateLimit } from "@/lib/api-utils"

// Mock database for development
const MOCK_USERS = [
  { username: 'admin', email: 'admin@example.com' },
  { username: 'user', email: 'user@example.com' },
  { username: 'test', email: 'test@example.com' },
  { username: 'MaiAn', email: 'maian@example.com' },
  { username: 'MaiAn1', email: 'maian1@example.com' },
];

// Mock functions for development
async function usernameExists(username: string): Promise<boolean> {
  return MOCK_USERS.some(user => user.username === username);
}

async function emailExists(email: string): Promise<boolean> {
  return MOCK_USERS.some(user => user.email === email);
}

async function register(data: any): Promise<any> {
  // Check if username already exists in mock database
  if (MOCK_USERS.some(user => user.username === data.username)) {
    return {
      success: false,
      error: "Username already exists",
      message: "This username is already taken"
    };
  }
  
  // Add user to mock database
  const newUser = {
    id: MOCK_USERS.length + 1,
    uuid: crypto.randomUUID(),
    username: data.username,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  MOCK_USERS.push({ username: data.username, email: data.email });
  
  return {
    success: true,
    user: newUser,
    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
  };
}

// Define the registration schema with enhanced validation
const registerSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(32, "Mật khẩu không được vượt quá 32 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số"
    ),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu")
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed",
      code: "method_not_allowed"
    })
  }

  try {
    // Validate request body
    const result = registerSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Lỗi xác thực",
        details: result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: "validation_error"
      })
    }

    const { username, password } = result.data

    try {
      // Add a small delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if username already exists
      const usernameExistsResult = await usernameExists(username)
      if (usernameExistsResult) {
        return res.status(400).json({
          success: false,
          error: "Tên đăng nhập đã được sử dụng",
          field: "username",
          code: "username_taken"
        })
      }

      // Generate a unique email
      const baseEmail = `${username}@londonhsc.com`
      let email = baseEmail
      let emailSuffix = 1
      
      // Ensure email is unique
      while (await emailExists(email)) {
        email = `${username}${emailSuffix}@londonhsc.com`
        emailSuffix++
      }

      // Create user with required fields
      const registerResult = await register({
        username,
        password,
        email,
        firstName: username,
        lastName: ''
      });

      if (!registerResult.success) {
        console.error('Registration failed:', registerResult.error);
        return res.status(400).json({
          success: false,
          error: registerResult.error || "Đã xảy ra lỗi khi tạo tài khoản",
          details: registerResult.message || "Vui lòng thử lại sau",
          code: registerResult.error?.toLowerCase().replace(/\s+/g, '_') || 'registration_failed'
        });
      }

      // Return success response with user data if available
      const responseData: any = {
        success: true,
        message: "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.",
        token: registerResult.token,
      };

      // Only include user data if it exists
      if (registerResult.user) {
        responseData.user = {
          id: registerResult.user.id,
          username: registerResult.user.username,
          email: registerResult.user.email,
          firstName: registerResult.user.firstName,
          lastName: registerResult.user.lastName,
          role: registerResult.user.role,
          status: registerResult.user.status,
          createdAt: registerResult.user.createdAt,
          updatedAt: registerResult.user.updatedAt
        };
      }

      return res.status(201).json(responseData);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: "Lỗi hệ thống",
        details: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
        code: "internal_server_error"
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server. Vui lòng thử lại sau.",
      code: "internal_server_error"
    });
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
