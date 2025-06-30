"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
      )
      .refine(
        async (value) => {
          // Check if username is available
          const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
          const data = await res.json();
          return data.available;
        },
        {
          message: 'Tên đăng nhập đã được sử dụng',
        }
      ),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(32, "Mật khẩu không được vượt quá 32 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
        "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    }
  )

type FormValues = z.infer<typeof formSchema>

export default function Register() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          // Map API validation errors to form fields
          data.details.forEach((err: any) => {
            const field = err.path?.[0] || err.field;
            if (field) {
              form.setError(field, {
                type: 'manual',
                message: err.message || 'Giá trị không hợp lệ',
              });
            }
          });
          
          throw new Error(data.message || 'Vui lòng kiểm tra lại thông tin đã nhập');
        }
        
        // Handle field-specific errors
        if (data.field) {
          form.setError(data.field, {
            type: 'manual',
            message: data.error || 'Giá trị không hợp lệ',
          });
        }
        
        // Handle other API errors
        throw new Error(data.error || data.message || 'Đăng ký thất bại');
      }

      if (!data.success) {
        throw new Error(data.error || 'Đăng ký không thành công');
      }

      // Show success message and redirect to login page after 2 seconds
      toast({
        title: data.message || 'Đăng ký thành công!',
        description: 'Bạn có thể đăng nhập ngay bây giờ.',
        variant: 'default',
      });
      
      // Reset form
      form.reset()
      
      console.log('Registration successful, redirecting to login page...');
      
      // Redirect to login page immediately using window.location
      console.log('Registration successful, redirecting to login page using window.location...');
      // Thêm một chút delay để đảm bảo thông báo toast hiển thị trước khi chuyển trang
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error)
      
      // Only show toast for non-field specific errors
      if (!(error as any).response?.data?.details) {
        toast({
          title: 'Lỗi',
          description: error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại sau.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title="Đăng ký tài khoản - London SSI">
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Tạo tài khoản mới</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Tên đăng nhập *
                </Label>
                <Input
                  id="username"
                  placeholder="Tên đăng nhập"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Mật khẩu *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Xác nhận mật khẩu *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 h-10 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}