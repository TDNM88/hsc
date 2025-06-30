"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "../lib/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login, loading: authLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Get return URL from query parameters or router query
      const returnUrl = router.query.returnUrl as string || "/trade"
      console.log('User authenticated, redirecting to:', returnUrl)
      router.push(returnUrl)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      await login(email, password)
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">Nhập thông tin để truy cập tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={authLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={authLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm">
              <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
