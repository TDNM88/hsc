"use client"

import type React from "react"

import { useState } from "react"
import { User, LogOut, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logout, changePassword } from "@/lib/auth"

export function UserMenu() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await logout(token)
      // Clear local storage and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      // If no token, just redirect to login
      window.location.href = '/login'
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      // Get user ID from localStorage or context
      const userData = localStorage.getItem('user')
      if (!userData) {
        throw new Error('User not found')
      }
      const user = JSON.parse(userData)
      
      const result = await changePassword(user.id, currentPassword, newPassword)
      
      // On successful password change, clear token and redirect to login
      if (result.success) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        setSuccess("Đổi mật khẩu thành công")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        // Redirect to login after a short delay
        setTimeout(() => {
          setShowChangePassword(false)
          setSuccess("")
          window.location.href = '/login'
        }, 2000)
      } else {
        setError(result.error || "Đổi mật khẩu thất bại")
      }
    } catch (error) {
      console.error('Change password error:', error)
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-600 bg-orange-500">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
            <Key className="mr-2 h-4 w-4" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
