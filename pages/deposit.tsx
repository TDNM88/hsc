"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/layout/Layout';
import { useMockUser } from '@/lib/mock-user';

const formSchema = z.object({
  amount: z.number().min(1, 'Vui lòng nhập số tiền'),
  bank: z.string().min(1, 'Vui lòng chọn ngân hàng')
});

const Deposit: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const user = useMockUser();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      bank: ''
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Thành công",
      description: "Gửi yêu cầu nạp tiền thành công!",
    });
  };

  const banks = [
    { id: 'vietcombank', name: 'Vietcombank' },
    { id: 'techcombank', name: 'Techcombank' },
    { id: 'bidv', name: 'BIDV' },
    { id: 'vietinbank', name: 'VietinBank' },
    { id: 'agribank', name: 'Agribank' },
  ];

  return (
    <Layout title="Nạp tiền - London SSI">
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
              variant="default"
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/deposit')}
            >
              Nạp tiền
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800"
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
                
                <CardTitle className="text-white text-xl mb-4">Nạp tiền</CardTitle>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Số tiền</FormLabel>
                          <div className="flex">
                            <FormControl>
                              <Input
                                type="number"
                                min={user?.minimumDeposit || 10000}
                                placeholder="Nhập số tiền"
                                className="text-white bg-gray-700 border-gray-600"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <span className="inline-flex items-center px-3 text-sm text-gray-300 bg-gray-700 border border-l-0 border-gray-600 rounded-r-md">
                              VND
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Ngân hàng</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Chọn ngân hàng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              {banks.map((bank) => (
                                <SelectItem key={bank.id} value={bank.id}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Xác nhận
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
        </div>
      </Layout>
  );
};

export default Deposit;
