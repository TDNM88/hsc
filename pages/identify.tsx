"use client";

import React from 'react';
import { useMockUser } from '@/lib/mock-user';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import Layout from '../components/layout/Layout';

const formSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  frontCardImage: z.string().min(1, 'Vui lòng tải lên ảnh mặt trước'),
  backCardImage: z.string().min(1, 'Vui lòng tải lên ảnh mặt sau'),
  selfieImage: z.string().min(1, 'Vui lòng tải lên ảnh selfie')
});

const Identify: React.FC = () => {
  const { toast } = useToast();
  const user = useMockUser();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user.name || '',
      frontCardImage: '',
      backCardImage: '',
      selfieImage: ''
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Thành công",
      description: "Đã gửi thông tin xác minh danh tính!",
    });
  };

  return (
    <Layout title="Xác minh danh tính - London SSI">
      <div className="bg-gray-900 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push('/account')}
              >
                Tổng quan
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push('/bank')}
              >
                Thông tin ngân hàng
              </Button>
              <Button 
                variant="default"
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push('/identify')}
              >
                Xác minh danh tính
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => router.push('/change-password')}
              >
                Thay đổi mật khẩu
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center gap-4 text-white">
                    <span>{user.username || 'N/A'}</span>
                    <span>ID: {user.uid || 'N/A'}</span>
                    <span>Ngày Đăng ký: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
                    <Badge variant={user.isVerified ? 'default' : 'destructive'}>
                      {user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Xác minh danh tính</CardTitle>
                  <CardDescription className="text-gray-400">
                    Vui lòng cung cấp thông tin chính xác để xác minh danh tính của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Họ tên thật</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nhập họ tên" 
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
                        name="frontCardImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Mặt trước thẻ căn cước</FormLabel>
                            <FormControl>
                              <Input 
                                type="file"
                                className="bg-gray-700 border-gray-600 text-white"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="backCardImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Mặt sau thẻ căn cước</FormLabel>
                            <FormControl>
                              <Input 
                                type="file"
                                className="bg-gray-700 border-gray-600 text-white"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="selfieImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Ảnh selfie với thẻ căn cước</FormLabel>
                            <FormControl>
                              <Input 
                                type="file"
                                className="bg-gray-700 border-gray-600 text-white"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Gửi yêu cầu xác minh
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

export default Identify;
