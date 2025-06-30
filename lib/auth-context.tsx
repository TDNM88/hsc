'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { toast } from '@/components/ui/use-toast'

export interface User {
  id: number
  username: string
  email: string
  balance: number
  role: string
  uid?: string
  createdAt?: string | Date
  isVerified?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    name: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser()
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // This ensures cookies are sent with the request
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      await refreshUser()
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng bạn quay trở lại!',
      })
      
      const returnUrl = router.query.returnUrl as string || '/trade'
      await router.push(returnUrl)
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Lỗi đăng nhập',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng nhập',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    name: string
    phone: string
  }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Auto-login after registration
      await login(userData.email, userData.password)
      
      toast({
        title: 'Đăng ký thành công',
        description: 'Tài khoản của bạn đã được tạo thành công!',
      })
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Lỗi đăng ký',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng ký',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Lỗi đăng xuất',
        description: 'Đã xảy ra lỗi khi đăng xuất',
        variant: 'destructive',
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
