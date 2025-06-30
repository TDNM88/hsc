import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number | string, currency = "USD"): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// Number formatting
export function formatNumber(num: number | string, decimals = 2): string {
  const numValue = typeof num === "string" ? Number.parseFloat(num) : num

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

// Percentage formatting
export function formatPercentage(value: number | string, decimals = 2): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue / 100)
}

// Date formatting
export function formatDate(date: Date | string, format: "short" | "long" | "time" | "datetime" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    case "long":
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    case "time":
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    case "datetime":
      return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    default:
      return dateObj.toLocaleDateString()
  }
}

// Time ago formatting
export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// Generate random string
export function generateRandomString(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate UUID v4
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitize string
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, "").trim()
}

// Truncate text
export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Calculate win rate
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return Math.round((wins / total) * 100 * 100) / 100
}

// Calculate profit/loss
export function calculateProfitLoss(amount: number, payout: number, result: "win" | "loss"): number {
  if (result === "win") {
    return payout - amount
  } else {
    return -amount
  }
}

// Calculate payout
export function calculatePayout(amount: number, profitPercentage: number): number {
  return amount + (amount * profitPercentage) / 100
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

// Check if file type is allowed
export function isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = getFileExtension(filename).toLowerCase()
  return allowedTypes.includes(extension)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T
  if (typeof obj === "object") {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Retry function
export async function retry<T>(fn: () => Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break
      await sleep(delay * attempt)
    }
  }

  throw lastError!
}

// Get client IP address
export function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    "127.0.0.1"
  )
    .split(",")[0]
    .trim()
}

// Generate pagination info
export function generatePagination(currentPage: number, totalItems: number, itemsPerPage: number) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1)

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  }
}

// Color utilities
export const colors = {
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  primary: "#6366F1",
  secondary: "#64748B",
}

// Trading utilities
export const tradingUtils = {
  // Calculate required margin
  calculateMargin: (amount: number, leverage = 1): number => {
    return amount / leverage
  },

  // Calculate position size
  calculatePositionSize: (accountBalance: number, riskPercentage: number, stopLoss: number): number => {
    const riskAmount = accountBalance * (riskPercentage / 100)
    return riskAmount / stopLoss
  },

  // Calculate pip value
  calculatePipValue: (lotSize: number, exchangeRate = 1): number => {
    return (0.0001 * lotSize) / exchangeRate
  },

  // Format trading symbol
  formatSymbol: (symbol: string): string => {
    return symbol.replace("/", "").toUpperCase()
  },
}

export default {
  cn,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  timeAgo,
  generateRandomString,
  generateUUID,
  isValidEmail,
  isValidPhone,
  validatePassword,
  sanitizeString,
  truncateText,
  calculateWinRate,
  calculateProfitLoss,
  calculatePayout,
  formatFileSize,
  getFileExtension,
  isAllowedFileType,
  debounce,
  throttle,
  deepClone,
  sleep,
  retry,
  getClientIP,
  generatePagination,
  colors,
  tradingUtils,
}
