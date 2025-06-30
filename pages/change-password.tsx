"use client";

import React, { useState } from 'react';
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
import { useAuth } from '@/lib/auth-context';

const formSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
});

type FormValues = z.infer<typeof formSchema>;

const ChangePassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      newPassword: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.password,
          newPassword: values.newPassword,
          confirmPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          form.setError(data.field === 'currentPassword' ? 'password' : data.field, {
            type: 'manual',
            message: data.error || 'Lỗi xác thực',
          });
        }
        throw new Error(data.error || 'Đổi mật khẩu thất bại');
      }

      // Reset form
      form.reset();
      
      toast({
        title: 'Thành công',
        description: data.message || 'Đổi mật khẩu thành công!',
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
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
