"use client";

import React, { useState } from 'react';
import { useMockUser } from '@/lib/mock-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface WithdrawTransaction {
  id: string;
  createdAt: Date;
  amount: number;
  status: 'pending' | 'approve' | 'rejected';
  bankName: string;
  bankNumber: string;
  holderName: string;
}

const statusVariant = {
  pending: 'bg-yellow-500 hover:bg-yellow-600',
  approve: 'bg-green-500 hover:bg-green-600',
  rejected: 'bg-red-500 hover:bg-red-600',
};

const statusText = {
  pending: 'Chờ duyệt',
  approve: 'Thành công',
  rejected: 'Từ chối',
};

const WithdrawHistory = () => {
  const user = useMockUser();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <div>Loading user data...</div>; // Show loading state
  }
  
  if (!user) {
    router.push('/login'); // Redirect to login if not authenticated
    return null;
  }

  // Mock data - replace with API call
  const dataSource: WithdrawTransaction[] = [
    { 
      id: '1', 
      createdAt: new Date(), 
      amount: 10000, 
      status: 'pending', 
      bankName: 'Vietcombank', 
      bankNumber: '123456789', 
      holderName: 'Nguyen Van A' 
    },
  ];

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const navItems = [
    { label: 'Lịch sử giao dịch', path: '/orders' },
    { label: 'Nạp tiền', path: '/deposit' },
    { label: 'Rút tiền', path: '/withdraw' },
    { label: 'Lịch sử nạp tiền', path: '/deposit-history' },
    { label: 'Lịch sử rút tiền', path: '/withdraw-history', active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4 space-y-2">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`h-12 flex items-center px-4 font-medium cursor-pointer rounded-md transition-colors ${
                  item.active 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'hover:bg-gray-800'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ví của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Số dư: <span className="font-bold">{formatCurrency(user?.balance || 0)}</span></p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Lịch sử rút tiền</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-gray-700 rounded-md" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Ngày tạo</TableHead>
                        <TableHead className="text-white">Số tiền rút</TableHead>
                        <TableHead className="text-white">Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataSource.map((record) => (
                        <React.Fragment key={record.id}>
                          <TableRow className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell>{record.createdAt.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                            <TableCell>
                              <Badge className={statusVariant[record.status]}>
                                {statusText[record.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleRow(record.id)}
                                className="text-blue-400 hover:bg-blue-900/30"
                              >
                                {expandedRows[record.id] ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedRows[record.id] && (
                            <TableRow className="border-gray-700 bg-gray-700/30">
                              <TableCell colSpan={4}>
                                <div className="p-4 space-y-2">
                                  <p><span className="text-gray-400">Loại giao dịch:</span> Ngân hàng</p>
                                  <p><span className="text-gray-400">Số tiền rút:</span> {formatCurrency(record.amount)}</p>
                                  <p><span className="text-gray-400">Số tiền nhận:</span> {formatCurrency(record.amount * 0.95)}</p>
                                  <p><span className="text-gray-400">Ngân hàng:</span> {record.bankName}</p>
                                  <p><span className="text-gray-400">Số tài khoản:</span> {record.bankNumber}</p>
                                  <p><span className="text-gray-400">Người thụ hưởng:</span> {record.holderName}</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="px-3 py-1 bg-gray-700 rounded-md">
                    {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!dataSource || dataSource.length < 20}
                  >
                    Tiếp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawHistory;
