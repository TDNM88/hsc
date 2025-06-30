"use client"

import type React from "react"
import { useRouter } from "next/router"
import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMockUser } from "@/lib/mock-user"

const Account: React.FC = () => {
  const user = useMockUser()
  const router = useRouter()

  return (
    <Layout title="Tài khoản - London SSI">
      <div className="bg-gray-900 py-8 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/account")}
                >
                  Tổng quan
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => router.push("/bank")}
                >
                  Thông tin ngân hàng
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => router.push("/identify")}
                >
                  Xác minh danh tính
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => router.push("/change-password")}
                >
                  Thay đổi mật khẩu
                </Button>
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <p className="px-4 text-sm text-gray-400 mb-2">Lịch sử giao dịch</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-gray-800"
                    onClick={() => router.push("/deposit-history")}
                  >
                    Lịch sử nạp tiền
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-gray-800"
                    onClick={() => router.push("/withdraw-history")}
                  >
                    Lịch sử rút tiền
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div style={{ color: "white", fontSize: "16px" }}>
                <div className="mb-6">
                  <span className="mr-4">{user?.name || user?.username || 'Không tên'}</span>
                  <span className="mr-4">ID: {user?.uid || user?.id || 'N/A'}</span>
                  <span className="mr-4">
                    Ngày Đăng ký: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                  </span>
                  <Badge variant={user?.isVerified ? "default" : "destructive"}>
                    {user?.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </Badge>
                </div>
                <div className="mb-6">
                  <span>Tổng tài sản quy đổi</span>
                  <h2 className="text-3xl font-bold text-white">{(user?.balance ?? 0).toLocaleString()} VND</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">Thông tin tài khoản</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 w-32">Tên đăng nhập:</span>
                          <span className="text-white">{user?.username || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 w-32">Email:</span>
                          <span className="text-white">{user?.email || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 w-32">Trạng thái:</span>
                          <Badge variant={user?.isActive ? 'default' : 'destructive'} className="ml-2">
                            {user?.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 w-32">Xác minh danh tính:</span>
                          <Badge variant={user.isVerified ? 'default' : 'destructive'} className="ml-2">
                            {user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 w-32">Ngày đăng ký:</span>
                          <span className="text-white">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="bg-gray-700 p-4 rounded">
                    <h4 className="text-lg mb-2">Cài đặt giao dịch</h4>
                    <p>Số tiền tối thiểu: {(user?.minimumBet ?? 0).toLocaleString()} VND</p>
                    <p>Nạp tiền tối thiểu: {(user?.minimumDeposit ?? 0).toLocaleString()} VND</p>
                    <p>Rút tiền tối thiểu: {(user?.minimumWithdraw ?? 0).toLocaleString()} VND</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Layout>
  )
}

export default Account
