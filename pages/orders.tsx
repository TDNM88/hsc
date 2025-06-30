"use client";

import React, { useState } from 'react';
import { useMockUser } from '@/lib/mock-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  turn: {
    turnId: string;
  };
  betValue: 'up' | 'down';
  amount: number;
  winningAmount: number | null;
}

const Orders = () => {
  const user = useMockUser();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with API call
  const dataSource: Order[] = [
    { 
      id: '1',
      turn: { turnId: '001' }, 
      betValue: 'up', 
      amount: 10000, 
      winningAmount: 5000 
    },
    {
      id: '2',
      turn: { turnId: '002' },
      betValue: 'down',
      amount: 15000,
      winningAmount: null
    },
  ];

  const navItems = [
    { label: 'Lịch sử giao dịch', path: '/orders', active: true },
    { label: 'Nạp tiền', path: '/deposit' },
    { label: 'Rút tiền', path: '/withdraw' },
    { label: 'Lịch sử nạp tiền', path: '/deposit-history' },
    { label: 'Lịch sử rút tiền', path: '/withdraw-history' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

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
          <div className="w-full md:w-3/4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Lịch sử giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-gray-700 rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white">Phiên</TableHead>
                          <TableHead className="text-white">Loại</TableHead>
                          <TableHead className="text-white">Số tiền</TableHead>
                          <TableHead className="text-right text-white">Kết quả</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataSource.map((order) => (
                          <TableRow key={order.id} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell className="font-medium">
                              {order.turn.turnId}
                            </TableCell>
                            <TableCell>
                              <span className={order.betValue === 'up' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                {order.betValue === 'up' ? 'MUA' : 'BÁN'}
                              </span>
                            </TableCell>
                            <TableCell>{formatCurrency(order.amount)}</TableCell>
                            <TableCell className="text-right">
                              {order.winningAmount !== null ? (
                                <span className={order.winningAmount > 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                  {formatCurrency(order.winningAmount)}
                                </span>
                              ) : (
                                <span className="text-yellow-500 font-bold">Chờ kết quả</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                    disabled={!dataSource || dataSource.length < 10}
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

export default Orders;
