"use client";

import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMockUser } from '@/lib/mock-user';

const formSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
});

type FormValues = z.infer<typeof formSchema>;

const ChangePassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const user = useMockUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      newPassword: ''
    }
  });

  const onSubmit = (values: FormValues) => {
    toast({
      title: 'Thành công',
      description: 'Đổi mật khẩu thành công!',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4 space-y-2">
            <div 
              onClick={() => router.push('/account')} 
              className="h-12 flex items-center px-4 font-medium cursor-pointer rounded-md hover:bg-gray-800 transition-colors"
            >
              Tổng quan
            </div>
            <div 
              onClick={() => router.push('/bank')} 
              className="h-12 flex items-center px-4 font-medium cursor-pointer rounded-md hover:bg-gray-800 transition-colors"
            >
              Thông tin ngân hàng
            </div>
            <div 
              onClick={() => router.push('/identify')} 
              className="h-12 flex items-center px-4 font-medium cursor-pointer rounded-md hover:bg-gray-800 transition-colors"
            >
              Xác minh danh tính
            </div>
            <div 
              onClick={() => router.push('/change-password')} 
              className="h-12 flex items-center px-4 font-medium cursor-pointer rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Thay đổi mật khẩu
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span>Tên đăng nhập: <span className="font-medium">{user?.username}</span></span>
                    <span>ID: <span className="font-medium">{user?.uid}</span></span>
                    <span>Ngày Đăng ký: <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span></span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${user?.isVerified ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {user?.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </span>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Mật khẩu hiện tại</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                className="bg-gray-700 border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Mật khẩu mới</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                className="bg-gray-700 border-gray-600 text-white"
                                {...field}
                              />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
