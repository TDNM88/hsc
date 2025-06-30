"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth-context';

// Mock data - replace with actual API call
const depositHistory = [
  {
    id: '1',
    amount: 5000000,
    status: 'Thành công',
    date: '2023-06-24 14:30:00',
    transactionCode: 'DEP123456'
  },
  {
    id: '2',
    amount: 2000000,
    status: 'Đang xử lý',
    date: '2023-06-23 09:15:00',
    transactionCode: 'DEP123455'
  },
  {
    id: '3',
    amount: 10000000,
    status: 'Thất bại',
    date: '2023-06-22 16:45:00',
    transactionCode: 'DEP123454'
  }
];

const DepositHistory: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'thành công':
        return 'success';
      case 'đang xử lý':
        return 'warning';
      case 'thất bại':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Layout title="Lịch sử nạp tiền - London SSI">
        <div className="bg-gray-900 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => handleNavigate('/orders')}
                >
                  Lịch sử giao dịch
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => handleNavigate('/deposit')}
                >
                  Nạp tiền
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => handleNavigate('/withdraw')}
                >
                  Rút tiền
                </Button>
                <Button 
                  variant="default"
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleNavigate('/deposit-history')}
                >
                  Lịch sử nạp tiền
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={() => handleNavigate('/withdraw-history')}
                >
                  Lịch sử rút tiền
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4 text-white">
                      <span className="text-lg font-medium">Số dư khả dụng:</span>
                      <span className="text-2xl font-bold text-green-500">
                        {user?.balance?.toLocaleString()} VND
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Lịch sử nạp tiền</CardTitle>
                    <CardDescription className="text-gray-400">
                      Danh sách các giao dịch nạp tiền vào tài khoản
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-gray-700">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Mã giao dịch</TableHead>
                            <TableHead className="text-white">Số tiền</TableHead>
                            <TableHead className="text-white">Trạng thái</TableHead>
                            <TableHead className="text-right text-white">Thời gian</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {depositHistory.map((transaction) => (
                            <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-700/50">
                              <TableCell className="font-medium text-white">
                                {transaction.transactionCode}
                              </TableCell>
                              <TableCell className="text-green-400">
                                +{transaction.amount.toLocaleString()} VND
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(transaction.status) as any}>
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-gray-400">
                                {transaction.date}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {depositHistory.length === 0 && (
                        <div className="py-8 text-center text-gray-400">
                          Không có giao dịch nào
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default DepositHistory;
