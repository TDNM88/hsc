// pages/admin/dashboard.tsx
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign,
  Wallet,
  Settings,
  X,
  Menu,
  Trash2,
  Pencil,
  Check,
  ChevronDown,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for admin dashboard
const mockData = {
  customers: [
    { 
      id: 'Nguyemtrang123', 
      balance: 0, 
      frozenBalance: 0,
      ipLogin: '171.251.237.143, 172.71.124.65',
      status: 'Hoạt động',
      verified: true,
      betLocked: false,
      withdrawLocked: false
    },
    { 
      id: 'vuituanhtra', 
      balance: 420000, 
      frozenBalance: 600000,
      ipLogin: '171.224.178.182, 104.23.175.38',
      status: 'Hoạt động',
      verified: true,
      betLocked: false,
      withdrawLocked: false
    },
    { 
      id: 'Nguyễn Thị Tuyết', 
      balance: 0, 
      frozenBalance: 0,
      ipLogin: '2a03:bac5:0445:9.263c:c3ef:30, 172.68.211.6',
      status: 'Hoạt động',
      verified: true,
      betLocked: false,
      withdrawLocked: false
    },
    { 
      id: 'Ma thi Thanh', 
      balance: 0, 
      frozenBalance: 0,
      ipLogin: '171.254.200.151, 172.68.164.127',
      status: 'Hoạt động',
      verified: true,
      betLocked: false,
      withdrawLocked: false
    },
  ],
  depositRequests: [
    { id: '1', time: '28/06/2025 21:31:58', user: 'nguoikhongten22@gmail.com', amount: 3000000, bank: 'Vietcombank', status: 'Chờ duyệt' },
    { id: '2', time: '28/06/2025 19:21:08', user: 'ThuThao85', amount: 3000000, bank: 'Techcombank', status: 'Đã duyệt' },
    { id: '3', time: '28/06/2025 19:09:03', user: 'phamhongocchinh16814@gmail.com', amount: 3000000, bank: 'MB Bank', status: 'Chờ duyệt' },
  ],
  withdrawalRequests: [
    { id: '1', time: '28/06/2025 23:00:32', user: 'Dinh Thi Tu Anh', amount: 5000000, deducted: 4750000, bank: 'Vietinbank', account: '10487691067', fullName: 'DINH THI TU ANH', status: 'Chờ duyệt' },
    { id: '2', time: '28/06/2025 23:00:04', user: 'Dinh Thi Tu Anh', amount: 5000000, deducted: 4750000, bank: 'Vietinbank', account: '10487691067', fullName: 'DINH THI TU ANH', status: 'Chờ duyệt' },
  ],
  accountSummary: {
    totalAccounts: 131,
    totalBalance: 10498420000,
    totalDeposits: 6980829240,
    totalWithdrawals: 5600000,
  },
  trades: [
    { id: '1', time: '28/06/2025 10:19:00', user: 'user1@example.com', amount: 5000000, type: 'deposit', status: 'completed' },
    { id: '2', time: '28/06/2025 10:18:00', user: 'user2@example.com', amount: 3000000, type: 'withdraw', status: 'pending' },
  ],
};

interface DashboardProps {
  data: typeof mockData;
}

const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { id: 'users', label: 'Khách hàng', icon: <Users size={20} /> },
  { id: 'trades', label: 'Lịch sử đặt lệnh', icon: <Clock size={20} /> },
  { id: 'deposits', label: 'Yêu cầu nạp tiền', icon: <DollarSign size={20} /> },
  { id: 'withdrawals', label: 'Yêu cầu rút tiền', icon: <Wallet size={20} /> },
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
];

export default function Dashboard({ data: initialData }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [dateRange, setDateRange] = useState({ start: '01/06/2025', end: '29/06/2025' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleNavigation = (itemId: string) => setActiveItem(itemId);

  // Customer actions
  const toggleCustomerStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(customer => 
        customer.id === id 
          ? { ...customer, status: customer.status === 'Hoạt động' ? 'Offline' : 'Hoạt động' } 
          : customer
      )
    }));
  };

  const toggleVerification = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(customer => 
        customer.id === id 
          ? { ...customer, verified: !customer.verified } 
          : customer
      )
    }));
  };

  const toggleBetLock = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(customer => 
        customer.id === id 
          ? { ...customer, betLocked: !customer.betLocked } 
          : customer
      )
    }));
  };

  const toggleWithdrawLock = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(customer => 
        customer.id === id 
          ? { ...customer, withdrawLocked: !customer.withdrawLocked } 
          : customer
      )
    }));
  };

  const handleEditCustomer = (id: string) => {
    console.log('Edit customer:', id);
  };

  const handleDeleteCustomer = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.filter(customer => customer.id !== id)
    }));
  };

  // Deposit actions
  const approveDeposit = (id: string) => {
    setData(prev => ({
      ...prev,
      depositRequests: prev.depositRequests.map(request => 
        request.id === id 
          ? { ...request, status: 'Đã duyệt' } 
          : request
      )
    }));
  };

  const rejectDeposit = (id: string) => {
    setData(prev => ({
      ...prev,
      depositRequests: prev.depositRequests.filter(request => request.id !== id)
    }));
  };

  // Withdrawal actions
  const approveWithdrawal = (id: string) => {
    setData(prev => ({
      ...prev,
      withdrawalRequests: prev.withdrawalRequests.map(request => 
        request.id === id 
          ? { ...request, status: 'Đã duyệt' } 
          : request
      )
    }));
  };

  const rejectWithdrawal = (id: string) => {
    setData(prev => ({
      ...prev,
      withdrawalRequests: prev.withdrawalRequests.filter(request => request.id !== id)
    }));
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tài khoản</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.accountSummary.totalAccounts}</div>
                  <p className="text-xs text-gray-500">Tổng số tài khoản</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng tiền</CardTitle>
                  <Wallet className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.accountSummary.totalBalance.toLocaleString()} đ</div>
                  <p className="text-xs text-gray-500">Tổng số dư</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng nạp</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.accountSummary.totalDeposits.toLocaleString()} đ</div>
                  <p className="text-xs text-gray-500">Tổng tiền nạp</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tổng rút</CardTitle>
                  <Wallet className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.accountSummary.totalWithdrawals.toLocaleString()} đ</div>
                  <p className="text-xs text-gray-500">Tổng tiền rút</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Danh sách khách hàng</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Lọc</span>
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Tên đăng nhập</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số dư</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">IP login</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thông tin xác minh</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {data.customers.map((customer) => (
                      <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{customer.id}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span>Số dư: {customer.balance.toLocaleString()} đ</span>
                            <span className="text-sm text-gray-500">Đóng băng: {customer.frozenBalance.toLocaleString()} đ</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{customer.ipLogin}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">Họ tên: -</span>
                            <span className="text-sm">CCCD mặt trước: -</span>
                            <span className="text-sm">CCCD mặt sau: -</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-24 text-sm text-gray-600">Hoạt động:</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Switch
                                    checked={customer.status === 'Hoạt động'}
                                    onCheckedChange={() => toggleCustomerStatus(customer.id)}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {customer.status === 'Hoạt động' ? 'Tắt trạng thái' : 'Bật trạng thái'}
                                </TooltipContent>
                              </Tooltip>
                              <Badge variant={customer.status === 'Hoạt động' ? 'success' : 'secondary'}>
                                {customer.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="w-24 text-sm text-gray-600">Xác minh:</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Switch
                                    checked={customer.verified}
                                    onCheckedChange={() => toggleVerification(customer.id)}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {customer.verified ? 'Hủy xác minh' : 'Xác minh tài khoản'}
                                </TooltipContent>
                              </Tooltip>
                              <Badge variant={customer.verified ? 'success' : 'secondary'}>
                                {customer.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="w-24 text-sm text-gray-600">Khóa cược:</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Switch
                                    checked={customer.betLocked}
                                    onCheckedChange={() => toggleBetLock(customer.id)}
                                    className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-300"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {customer.betLocked ? 'Mở khóa cược' : 'Khóa cược'}
                                </TooltipContent>
                              </Tooltip>
                              <Badge variant={customer.betLocked ? 'destructive' : 'secondary'}>
                                {customer.betLocked ? 'Đã khóa' : 'Mở'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="w-24 text-sm text-gray-600">Khóa rút:</span>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Switch
                                    checked={customer.withdrawLocked}
                                    onCheckedChange={() => toggleWithdrawLock(customer.id)}
                                    className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-300"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {customer.withdrawLocked ? 'Mở khóa rút' : 'Khóa rút tiền'}
                                </TooltipContent>
                              </Tooltip>
                              <Badge variant={customer.withdrawLocked ? 'destructive' : 'secondary'}>
                                {customer.withdrawLocked ? 'Đã khóa' : 'Mở'}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                                  onClick={() => handleEditCustomer(customer.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Chỉnh sửa</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Xóa khách hàng</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-red-600 focus:bg-red-50"
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                >
                                  Xác nhận xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'trades':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Lịch sử đặt lệnh</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Input
                  type="date"
                  className="w-full"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <Input
                  type="date"
                  className="w-full"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
                <Button className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Áp dụng</span>
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Khách hàng</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Loại</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {data.trades.map((trade) => (
                      <tr key={trade.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{trade.time}</td>
                        <td className="p-4 align-middle">{trade.user}</td>
                        <td className="p-4 align-middle">{trade.amount.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">
                          <Badge variant={trade.type === 'deposit' ? 'success' : 'destructive'}>
                            {trade.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                        <Badge variant={trade.status === 'completed' ? 'success' : 'secondary'}>
                          {trade.status === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
                        </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'deposits':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Yêu cầu nạp tiền</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Input
                  placeholder="Tìm khách hàng"
                  className="w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Lọc</span>
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Khách hàng</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Ngân hàng</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {data.depositRequests.map((request) => (
                      <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{request.time}</td>
                        <td className="p-4 align-middle">{request.user}</td>
                        <td className="p-4 align-middle">{request.amount.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">{request.bank}</td>
                        <td className="p-4 align-middle">
                        <Badge variant={request.status === 'Đã duyệt' ? 'success' : 'secondary'}>
                          {request.status}
                        </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white gap-1"
                                  disabled={request.status === 'Đã duyệt'}
                                  onClick={() => approveDeposit(request.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Duyệt</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Phê duyệt yêu cầu</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600 text-white gap-1"
                                  disabled={request.status === 'Đã duyệt'}
                                  onClick={() => rejectDeposit(request.id)}
                                >
                                  <X className="h-4 w-4" />
                                  <span>Từ chối</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Từ chối yêu cầu</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'withdrawals':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Yêu cầu rút tiền</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Input
                  type="date"
                  className="w-full"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <Input
                  type="date"
                  className="w-full"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
                <Button className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Áp dụng</span>
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thời gian</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Khách hàng</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số tiền</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Thực nhận</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Ngân hàng</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Số TK</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Chủ TK</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Trạng thái</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {data.withdrawalRequests.map((request) => (
                      <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{request.time}</td>
                        <td className="p-4 align-middle">{request.user}</td>
                        <td className="p-4 align-middle">{request.amount.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">{request.deducted.toLocaleString()} đ</td>
                        <td className="p-4 align-middle">{request.bank}</td>
                        <td className="p-4 align-middle">{request.account}</td>
                        <td className="p-4 align-middle">{request.fullName}</td>
                        <td className="p-4 align-middle">
                        <Badge variant={request.status === 'Đã duyệt' ? 'success' : 'secondary'}>
                          {request.status}
                        </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white gap-1"
                                  disabled={request.status === 'Đã duyệt'}
                                  onClick={() => approveWithdrawal(request.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Duyệt</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Phê duyệt yêu cầu</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600 text-white gap-1"
                                  disabled={request.status === 'Đã duyệt'}
                                  onClick={() => rejectWithdrawal(request.id)}
                                >
                                  <X className="h-4 w-4" />
                                  <span>Từ chối</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Từ chối yêu cầu</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin Ngân hàng nạp tiền</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên ngân hàng</label>
                    <Input defaultValue="ABBANK" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tài khoản</label>
                    <Input defaultValue="0387473721" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chủ tài khoản</label>
                    <Input defaultValue="VU VAN MIEN" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Cấu hình nạp rút</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền nạp tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền rút tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số tiền đặt lệnh tối thiểu</label>
                    <Input defaultValue="100.000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link CSKH</label>
                    <Input defaultValue="https://t.me/DICHVUCSKHSE" />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                Lưu cấu hình
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <span className="text-sm font-bold">AP</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center p-3 rounded-md text-sm font-medium transition-colors ${
                    activeItem === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeItem)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <span className="sr-only">Notifications</span>
                      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Thông báo</TooltipContent>
                </Tooltip>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  {sidebarOpen && (
                    <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      data: mockData,
    },
  };
};
