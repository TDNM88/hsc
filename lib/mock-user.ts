"use client"

import React from "react"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface User {
  id: number
  username: string
  email: string
  balance: number
  role: string
  uid?: string
  createdAt?: string | Date
  isVerified?: boolean
  // Add any other properties that might be needed
}

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

// Create a context for the mock user
const MockUserContext = createContext<UserContextType | undefined>(undefined)

// Create a provider component
export function MockUserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (): Promise<void> => {
    try {
      const token =
        localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]

      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.user.id,
          username: userData.user.username,
          email: userData.user.email,
          balance: Number.parseFloat(userData.user.balance),
          role: userData.user.role,
        })
      } else {
        // Token invalid, remove it
        localStorage.removeItem("token")
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const contextValue: UserContextType = {
    user,
    loading,
    refreshUser: fetchUser
  }

  // Always render the provider, but children can check loading state
  return React.createElement(
    MockUserContext.Provider,
    { value: contextValue },
    !loading ? children : null
  )
}

// Custom hook to use the mock user
export function useMockUser(): UserContextType {
  const context = useContext(MockUserContext)
  if (context === undefined) {
    throw new Error('useMockUser must be used within a MockUserProvider')
  }
  return context
}
