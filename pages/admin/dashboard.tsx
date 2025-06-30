"use client"

import type { GetServerSideProps } from "next"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { format } from "date-fns"
import { AdminDashboard } from "@/components/admin-dashboard"
import { useMockUser } from "@/lib/mock-user"
import { Loader2 } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  Wallet,
  Settings,
  X,
  Trash2,
  Pencil,
  Check,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const menuItems = [
  { id: "dashboard", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
  { id: "users", label: "Khách hàng", icon: <Users size={20} /> },
  { id: "trades", label: "Lịch sử đặt lệnh", icon: <Clock size={20} /> },
  { id: "deposits", label: "Yêu cầu nạp tiền", icon: <DollarSign size={20} /> },
  { id: "withdrawals", label: "Yêu cầu rút tiền", icon: <Wallet size={20} /> },
  { id: "settings", label: "Cài đặt", icon: <Settings size={20} /> },
]

export default function AdminDashboardPage() {
  const user = useMockUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeItem, setActiveItem] = useState("dashboard")
  const [data, setData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    if (user === null) {
      // Still loading
      return
    }

    if (!user) {
      router.push("/login?callbackUrl=" + encodeURIComponent("/admin/dashboard"))
      return
    }

    if (user.role !== "admin") {
      router.push("/trade")
      return
    }

    setLoading(false)
  }, [user, router])

  const formatDateForInput = (date: Date | string): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getCurrentDateString = (): string => {
    return formatDateForInput(new Date())
  }

  const [dateRange, setDateRange] = useState({
    start: getCurrentDateString(),
    end: getCurrentDateString(),
  })
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user.role === "admin") {
          // setIsAuthenticated(true)
        } else {
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/dashboard-stats")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu dashboard",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch users data
  const fetchUsersData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        search: searchQuery,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const usersData = await response.json()
        setData((prev) => ({ ...prev, customers: usersData.users }))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch transactions data
  const fetchTransactionsData = async (type: "deposits" | "withdrawals") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/transactions?type=${type}&page=1&limit=20`)
      if (response.ok) {
        const transactionsData = await response.json()
        if (type === "deposits") {
          setData((prev) => ({ ...prev, depositRequests: transactionsData.transactions }))
        } else {
          setData((prev) => ({ ...prev, withdrawalRequests: transactionsData.transactions }))
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "admin" && activeItem === "dashboard") {
      fetchDashboardData()
    } else if (user && user.role === "admin" && activeItem === "users") {
      fetchUsersData()
    } else if (user && user.role === "admin" && activeItem === "deposits") {
      fetchTransactionsData("deposits")
    } else if (user && user.role === "admin" && activeItem === "withdrawals") {
      fetchTransactionsData("withdrawals")
    }
  }, [user, activeItem, searchQuery, statusFilter])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const handleNavigation = (itemId: string) => setActiveItem(itemId)

  const handleUserAction = async (userId: string, action: string, value?: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Cập nhật người dùng thành công",
        })
        fetchUsersData() // Refresh data
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật người dùng",
        variant: "destructive",
      })
    }
  }

  const handleTransactionAction = async (transactionId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `${action === "approve" ? "Phê duyệt" : "Từ chối"} giao dịch thành công`,
        })

        // Refresh appropriate data
        if (activeItem === "deposits") {
          fetchTransactionsData("deposits")
        } else if (activeItem === "withdrawals") {
          fetchTransactionsData("withdrawals")
        }
      } else {
        throw new Error("Failed to update transaction")
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giao dịch",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    switch (activeItem) {
      case "dashboard":
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-row items-center justify-between gap-4 my-6">
              <div className="flex flex-row items-center gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="w-full"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <Button onClick={fetchDashboardData}>
                <Filter className="h-4 w-4" />
                <span>Lọc</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-500">Tổng tài khoản</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-500">Tổng số dư</CardTitle>
                  <Wallet className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(data.totalBalance || 0).toLocaleString()} đ</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-500">Tổng tiền nạp</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(data.totalDeposits || 0).toLocaleString()} đ</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-red-500">Tổng tiền rút</CardTitle>
                  <Wallet className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {(data.totalWithdrawals || 0).toLocaleString()} đ
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-green-500">Lệnh mới nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Người dùng</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Phiên</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Loại</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Kết quả</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Lãi/Lỗ</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {data.recentTrades && data.recentTrades.length > 0 ? (
                          data.recentTrades.map((trade: any) => (
                            <tr key={trade.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle">{trade.user.name}</td>
                              <td className="p-4 align-middle">{trade.session}</td>
                              <td className="p-4 align-middle">{trade.type}</td>
                              <td className="p-4 align-middle">{trade.amount.toLocaleString()} đ</td>
                              <td className="p-4 align-middle">{trade.result}</td>
                              <td className="p-4 align-middle">
                                {trade.profit > 0 ? (
                                  <span className="text-green-600">+{trade.profit.toLocaleString()} đ</span>
                                ) : trade.profit < 0 ? (
                                  <span className="text-red-600">{trade.profit.toLocaleString()} đ</span>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                {format(new Date(trade.createdAt), "dd/MM/yyyy HH:mm:ss")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-gray-500">
                              Không có dữ liệu
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Danh sách khách hàng</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Tên đăng nhập</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số dư</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.customers && data.customers.length > 0 ? (
                    data.customers.map((customer: any) => (
                      <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{customer.id}</td>
                        <td className="p-4 align-middle">{customer.email}</td>
                        <td className="p-4 align-middle">{customer.balance.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={customer.verified}
                              onCheckedChange={(checked) =>
                                handleUserAction(customer.id, "toggleVerification", checked)
                              }
                            />
                            <Badge variant={customer.verified ? "success" : "secondary"}>
                              {customer.verified ? "Đã xác minh" : "Chưa xác minh"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-blue-600">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-50 text-red-600"
                              onClick={() => handleUserAction(customer.id, "delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )

      case "deposits":
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Yêu cầu nạp tiền</h2>
              <Button onClick={() => fetchTransactionsData("deposits")}>
                <RefreshCw className="h-4 w-4" />
                <span>Làm mới</span>
              </Button>
            </div>

            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Khách hàng</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Ngân hàng</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.depositRequests && data.depositRequests.length > 0 ? (
                    data.depositRequests.map((request: any) => (
                      <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{request.time}</td>
                        <td className="p-4 align-middle">{request.user}</td>
                        <td className="p-4 align-middle">{request.amount.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">{request.bank}</td>
                        <td className="p-4 align-middle">
                          <Badge variant={request.status === "Đã duyệt" ? "success" : "secondary"}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={request.status === "Đã duyệt"}
                              onClick={() => handleTransactionAction(request.id, "approve")}
                            >
                              <Check className="h-4 w-4" />
                              <span>Duyệt</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={request.status === "Đã duyệt"}
                              onClick={() => handleTransactionAction(request.id, "reject")}
                            >
                              <X className="h-4 w-4" />
                              <span>Từ chối</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        Không có yêu cầu nạp tiền
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )

      case "withdrawals":
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Yêu cầu rút tiền</h2>
              <Button onClick={() => fetchTransactionsData("withdrawals")}>
                <RefreshCw className="h-4 w-4" />
                <span>Làm mới</span>
              </Button>
            </div>

            <div className="rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Khách hàng</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.withdrawalRequests && data.withdrawalRequests.length > 0 ? (
                    data.withdrawalRequests.map((request: any) => (
                      <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{request.time}</td>
                        <td className="p-4 align-middle">{request.user}</td>
                        <td className="p-4 align-middle">{request.amount.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">
                          <Badge variant={request.status === "Đã duyệt" ? "success" : "secondary"}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={request.status === "Đã duyệt"}
                              onClick={() => handleTransactionAction(request.id, "approve")}
                            >
                              <Check className="h-4 w-4" />
                              <span>Duyệt</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={request.status === "Đã duyệt"}
                              onClick={() => handleTransactionAction(request.id, "reject")}
                            >
                              <X className="h-4 w-4" />
                              <span>Từ chối</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Không có yêu cầu rút tiền
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin Ngân hàng nạp tiền</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên ngân hàng</label>
                    <Input defaultValue="ABBANK" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tài khoản</label>
                    <Input defaultValue="0387473721" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chủ tài khoản</label>
                    <Input defaultValue="VU VAN MIEN" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Cấu hình nạp rút</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền nạp tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền rút tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền đặt lệnh tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link CSKH</label>
                    <Input defaultValue="https://t.me/DICHVUCSKHSE" />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">Lưu cấu hình</Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Add authentication check here
  // For now, we'll allow access
  return {
    props: {},
  }
}
