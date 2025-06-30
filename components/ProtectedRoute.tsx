"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "../lib/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(router.asPath)
        router.push(`/login?returnUrl=${returnUrl}`)
        return
      }

      if (requireAdmin && user?.role !== "admin") {
        // Redirect to unauthorized page or home
        router.push("/")
        return
      }
    }
  }, [user, loading, requireAuth, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect in useEffect
  }

  if (requireAdmin && user?.role !== "admin") {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
