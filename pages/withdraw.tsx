"use client";

import React from 'react';
import { useMockUser } from '@/lib/mock-user';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  amount: z.number().min(1, 'Vui lòng nhập số tiền')
});

const Withdraw: React.FC = () => {
  const { toast } = useToast();
  const user = useMockUser();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (user?.isLockWithdraw) {
      toast({
        variant: "destructive",
        title: "Thất bại",
        description: "Tài khoản hiện không thể rút tiền. Vui lòng liên hệ CSKH!",
      });
    } else {
      toast({
        title: "Thành công",
        description: "Gửi yêu cầu rút tiền thành công!",
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push('/orders')}
            >
              Lịch sử giao dịch
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push('/deposit')}
            >
              Nạp tiền
            </Button>
            <Button 
              variant="default"
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/withdraw')}
            >
              Rút tiền
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push('/deposit-history')}
            >
              Lịch sử nạp tiền
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={() => router.push('/withdraw-history')}
            >
              Lịch sử rút tiền
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white mb-6">
                  <p className="text-lg">Số dư: {user?.balance?.toLocaleString()} VND</p>
                </div>
                
                <CardTitle className="text-white text-xl mb-4">Rút tiền</CardTitle>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Số tiền rút</Label>
                    <div className="flex">
                      <Input
                        id="amount"
                        type="number"
                        min={user?.minimumWithdraw || 10000}
                        placeholder="Nhập số tiền"
                        className="text-white bg-gray-700 border-gray-600"
                        {...form.register('amount', { valueAsNumber: true })}
                      />
                      <span className="inline-flex items-center px-3 text-sm text-gray-300 bg-gray-700 border border-l-0 border-gray-600 rounded-r-md">
                        VND
                      </span>
                    </div>
                    {form.formState.errors.amount && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Xác nhận
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
