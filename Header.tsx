"use client"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "../lib/auth-context"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { User, LogOut, Settings, Wallet } from "lucide-react"

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getUserInitials = (name?: string, username?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="London SSI" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">London SSI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/trade" className="text-gray-700 hover:text-gray-900 font-medium">
              Giao dịch
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-gray-900 font-medium">
              Lệnh
            </Link>
            <Link href="/deposit" className="text-gray-700 hover:text-gray-900 font-medium">
              Nạp tiền
            </Link>
            <Link href="/withdraw" className="text-gray-700 hover:text-gray-900 font-medium">
              Rút tiền
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Balance */}
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    ${Number.parseFloat(user.balance).toLocaleString()}
                  </span>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getUserInitials(user.name, user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name || user.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Tài khoản
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/change-password" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Đổi mật khẩu
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
