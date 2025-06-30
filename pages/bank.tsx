"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import { useMockUser } from '@/lib/mock-user';

const formSchema = z.object({
  holderName: z.string().min(1, 'Vui lòng nhập họ tên'),
  bankName: z.string().min(1, 'Vui lòng nhập tên ngân hàng'),
  bankNumber: z.string().min(1, 'Vui lòng nhập số tài khoản'),
});

const Bank = () => {
  const router = useRouter();
  const { toast } = useToast();
  const user = useMockUser();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      holderName: '',
      bankName: '',
      bankNumber: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
    
    toast({
      title: 'Thành công',
      description: 'Cập nhật thông tin ngân hàng thành công!',
    });
  };

  const navItems = [
    { label: 'Tổng quan', path: '/account' },
    { label: 'Thông tin ngân hàng', path: '/bank', active: true },
    { label: 'Xác minh danh tính', path: '/identify' },
    { label: 'Thay đổi mật khẩu', path: '/change-password' },
  ];

  return (
    <Layout title="Thông tin ngân hàng - London SSI">
      <div className="bg-gray-900 min-h-screen py-12">
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
                  <CardTitle className="text-white">Thông tin tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                      <span className="font-medium">{user?.username}</span>
                      <span className="hidden md:inline">•</span>
                      <span>ID: {user?.uid}</span>
                      <span className="hidden md:inline">•</span>
                      <span>Ngày Đăng ký: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
                      <Badge variant={user?.isVerified ? 'default' : 'destructive'} className="ml-auto">
                        {user?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </Badge>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="holderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập họ tên" {...field} className="bg-gray-700 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên ngân hàng</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập tên ngân hàng" {...field} className="bg-gray-700 border-gray-600 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số tài khoản</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập số tài khoản" {...field} className="bg-gray-700 border-gray-600 text-white" />
                            </FormControl>
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

export default Bank;
