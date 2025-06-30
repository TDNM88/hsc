"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface TradeRecord {
  id: string;
  session: string;
  userId: string;
  direction: "UP" | "DOWN";
  amount: number;
  status: "pending" | "win" | "lose";
  profit: number;
  createdAt: number;
}

interface TransactionRecord {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  userId: string;
  createdAt: number;
}

interface UserRecord {
  id: string;
  username: string;
  balance: number;
  createdAt: number;
}

export default function Dashboard() {
  const [history, setHistory] = useState<TradeRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [showMoreTrades, setShowMoreTrades] = useState(false);
  const [showMoreUsers, setShowMoreUsers] = useState(false);
  const [showMoreTransactions, setShowMoreTransactions] = useState(false);
  const [tradeFilter, setTradeFilter] = useState<"all" | "win" | "lose" | "pending">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "7days" | "30days">("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Lấy dữ liệu từ localStorage (hoặc thay bằng API: fetch("/api/trades"))
      const raw = localStorage.getItem("tradeHistory");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
          }
        } catch {
          // Bỏ qua lỗi parse
        }
      }
      if (!raw || history.length === 0) {
        const demo: TradeRecord[] = Array.from({ length: 100 }).map((_, i) => {
          const timestamp = Date.now() - i * 3600000; // Cách nhau 1 giờ
          const sessionIndex = Math.floor(i / 5) + 1; // mỗi phiên có 5 lệnh
          const session = sessionIndex.toString().padStart(7, "0");
          const direction = Math.random() > 0.5 ? "UP" : "DOWN";
          const amount = Math.floor(Math.random() * 4900000) + 100000; // 100K-5M
          const rand = Math.random();
          const status: TradeRecord["status"] = rand < 0.3 ? "win" : rand < 0.8 ? "lose" : "pending";
          const profit = status === "win" ? amount * 0.8 : status === "lose" ? -amount : 0;
          const usersPool = Array.from({ length: 20 }, (_, j) => `u${j + 1}`);
          return {
            id: `trade-${i}`,
            session,
            userId: usersPool[i % usersPool.length],
            direction,
            amount,
            status,
            profit,
            createdAt: timestamp,
          };
        });
        setHistory(demo);
        localStorage.setItem("tradeHistory", JSON.stringify(demo));
      }

      // Load users
      const rawUsers = localStorage.getItem("users");
      if (rawUsers) {
        try {
          const parsed = JSON.parse(rawUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed);
          }
        } catch {
          // Bỏ qua lỗi
        }
      }
      if (!rawUsers || users.length === 0) {
        const demoUsers: UserRecord[] = Array.from({ length: 20 }, (_, i) => {
          const balance = i < 3 ? -Math.floor(Math.random() * 500000) : Math.floor(Math.random() * 10000000); // 3 người số dư âm
          return {
            id: `u${i + 1}`,
            username: `Người Chơi ${i + 1}`,
            balance,
            createdAt: Date.now() - i * 86400000,
          };
        });
        setUsers(demoUsers);
        localStorage.setItem("users", JSON.stringify(demoUsers));
      }

      // Load transactions
      const rawTx = localStorage.getItem("transactions");
      if (rawTx) {
        try {
          const parsed = JSON.parse(rawTx);
          if (Array.isArray(parsed)) setTransactions(parsed);
        } catch {
          // Bỏ qua lỗi
        }
      }
      if (!rawTx || transactions.length === 0) {
        const demoTx: TransactionRecord[] = Array.from({ length: 50 }, (_, i) => {
          const isDeposit = Math.random() < 0.6;
          const amount = isDeposit ? Math.floor(Math.random() * 2000000) + 100000 : Math.floor(Math.random() * 3000000) + 100000;
          const usersPool = Array.from({ length: 20 }, (_, j) => `u${j + 1}`);
          return {
            id: `tx-${i}`,
            type: isDeposit ? "deposit" : "withdraw",
            amount: i < 5 && !isDeposit ? amount + 1000000 : amount, // 5 giao dịch rút lớn
            userId: usersPool[i % usersPool.length],
            createdAt: Date.now() - i * 7200000,
          };
        });
        setTransactions(demoTx);
        localStorage.setItem("transactions", JSON.stringify(demoTx));
      }
    }
  }, [history.length, users.length, transactions.length]);

  // Thống kê
  const stats = useMemo(() => {
    const total = history.length;
    const wins = history.filter((h) => h.status === "win").length;
    const loses = history.filter((h) => h.status === "lose").length;
    const pending = history.filter((h) => h.status === "pending").length;
    const winRate = total ? ((wins / total) * 100).toFixed(1) : "0";
    const grossProfit = history.reduce((acc, cur) => acc + cur.profit, 0);
    const houseProfit = history.reduce(
      (acc, cur) => acc + (cur.status === "lose" ? cur.amount : cur.status === "win" ? -cur.amount * 0.8 : 0),
      0
    );
    const userCount = users.length;
    const totalUserBalance = users.reduce((sum, u) => sum + u.balance, 0);
    const totalDeposit = transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
    const totalWithdraw = transactions.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0);
    const negativeBalanceUsers = users.filter((u) => u.balance < 0).length;
    const largeWithdrawals = transactions.filter((t) => t.type === "withdraw" && t.amount > 1000000).length;

    return {
      total,
      wins,
      loses,
      pending,
      winRate,
      grossProfit,
      houseProfit,
      userCount,
      totalUserBalance,
      totalDeposit,
      totalWithdraw,
      negativeBalanceUsers,
      largeWithdrawals,
    };
  }, [history, users, transactions]);

  // Lọc dữ liệu
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    return history
      .filter((h) => tradeFilter === "all" || h.status === tradeFilter)
      .filter((h) => {
        if (timeFilter === "7days") return h.createdAt >= now - 7 * 24 * 60 * 60 * 1000;
        if (timeFilter === "30days") return h.createdAt >= now - 30 * 24 * 60 * 60 * 1000;
        return true;
      });
  }, [history, tradeFilter, timeFilter]);

  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    return transactions.filter((t) => {
      if (timeFilter === "7days") return t.createdAt >= now - 7 * 24 * 60 * 60 * 1000;
      if (timeFilter === "30days") return t.createdAt >= now - 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [transactions, timeFilter]);

  // Biểu đồ dữ liệu
  const profitChartData = useMemo(() => {
    const days = Array.from({ length: timeFilter === "7days" ? 7 : 30 }).map((_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return format(date, "dd/MM");
    }).reverse();
    const profits = days.map((day) => {
      const dayStart = new Date().setHours(0, 0, 0, 0) - days.indexOf(day) * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const profit = history
        .filter((h) => h.createdAt >= dayStart && h.createdAt < dayEnd)
        .reduce(
          (acc, cur) => acc + (cur.status === "lose" ? cur.amount : cur.status === "win" ? -cur.amount * 0.8 : 0),
          0
        );
      return { date: day, profit };
    }).reverse();
    return profits;
  }, [history, timeFilter]);

  const tradeVolumeChartData = useMemo(() => {
    const days = Array.from({ length: timeFilter === "7days" ? 7 : 30 }).map((_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return format(date, "dd/MM");
    }).reverse();
    const volumes = days.map((day) => {
      const dayStart = new Date().setHours(0, 0, 0, 0) - days.indexOf(day) * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const volume = history.filter((h) => h.createdAt >= dayStart && h.createdAt < dayEnd).length;
      return { date: day, volume };
    }).reverse();
    return volumes;
  }, [history, timeFilter]);

  return (
    <Layout title="Dashboard - London SSI">
      <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-4">Bảng Điều Khiển Nhà Cái</h1>
        <p className="text-gray-300 mb-6">
          Đây là nơi bạn theo dõi cược, người chơi, và giao dịch. Mỗi số liệu dưới đây đều có giải thích cách tính. Nếu có cảnh báo (màu đỏ), hãy kiểm tra ngay!
        </p>

        {/* Cảnh báo */}
        {stats.negativeBalanceUsers > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>⚠️ Cảnh Báo: Có Người Chơi Nợ Tiền</AlertTitle>
            <AlertDescription>
              Có {stats.negativeBalanceUsers} người chơi có số dư âm (dưới 0 đồng). Vào tab "Người Chơi" để kiểm tra và liên hệ họ.
            </AlertDescription>
          </Alert>
        )}
        {stats.largeWithdrawals > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>⚠️ Cảnh Báo: Rút Tiền Lớn</AlertTitle>
            <AlertDescription>
              Có {stats.largeWithdrawals} giao dịch rút trên 1 triệu đồng. Vào tab "Giao Dịch" để xem chi tiết và xác minh.
            </AlertDescription>
          </Alert>
        )}

        {/* Thẻ thống kê */}
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Tổng Lệnh Cược"
              value={stats.total}
              tooltip="Đếm tất cả lệnh cược (thắng + thua + đang chờ) của người chơi."
              formula="Tổng = Số lệnh thắng + Số lệnh thua + Số lệnh đang chờ"
            />
            <StatCard
              label="Lệnh Thắng"
              value={stats.wins}
              className="text-green-400"
              tooltip="Số lệnh người chơi thắng. Bạn phải trả thưởng (số tiền cược × 0.8) cho các lệnh này."
              formula="Đếm số lệnh có trạng thái 'Thắng'"
            />
            <StatCard
              label="Lệnh Thua"
              value={stats.loses}
              className="text-red-400"
              tooltip="Số lệnh người chơi thua. Bạn thu được toàn bộ số tiền cược của các lệnh này."
              formula="Đếm số lệnh có trạng thái 'Thua'"
            />
            <StatCard
              label="Lệnh Đang Chờ"
              value={stats.pending}
              className="text-yellow-400"
              tooltip="Số lệnh chưa có kết quả. Không tính vào lãi/lỗ cho đến khi hoàn thành."
              formula="Đếm số lệnh có trạng thái 'Đang chờ'"
            />
            <StatCard
              label="Tỷ Lệ Thắng"
              value={`${stats.winRate}%`}
              tooltip="Phần trăm lệnh thắng của người chơi. Công thức: (Số lệnh thắng ÷ Tổng số lệnh) × 100."
              formula="(Số lệnh thắng ÷ Tổng số lệnh) × 100"
            />
            <StatCard
              label="Lợi Nhuận Nhà Cái"
              value={formatCurrency(stats.houseProfit)}
              className={stats.houseProfit >= 0 ? "text-green-400" : "text-red-400"}
              tooltip="Tiền bạn kiếm được. Công thức: Tổng tiền cược của lệnh thua - (Tổng tiền cược của lệnh thắng × 0.8). Đặt 10 trả 8."
              formula="Lợi nhuận = Tổng tiền cược thua - (Tổng tiền cược thắng × 0.8)"
            />
            <StatCard
              label="Tổng Tiền Nạp"
              value={formatCurrency(stats.totalDeposit)}
              tooltip="Tổng số tiền người chơi nạp vào hệ thống. Tính bằng cách cộng tất cả giao dịch nạp."
              formula="Cộng tất cả số tiền của giao dịch nạp"
            />
            <StatCard
              label="Tổng Tiền Rút"
              value={formatCurrency(stats.totalWithdraw)}
              tooltip="Tổng số tiền người chơi rút ra. Tính bằng cách cộng tất cả giao dịch rút."
              formula="Cộng tất cả số tiền của giao dịch rút"
            />
            <StatCard
              label="Số Người Chơi"
              value={stats.userCount}
              tooltip="Tổng số tài khoản người chơi trong hệ thống."
              formula="Đếm số tài khoản người chơi"
            />
            <StatCard
              label="Tổng Số Dư"
              value={formatCurrency(stats.totalUserBalance)}
              tooltip="Tổng số tiền còn lại trong tài khoản người chơi. Tính bằng cách cộng số dư của tất cả người chơi."
              formula="Cộng số dư của tất cả người chơi"
            />
          </div>
        </TooltipProvider>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lợi Nhuận Nhà Cái</CardTitle>
              <p className="text-gray-300 text-sm">
                Tiền bạn kiếm được mỗi ngày. Công thức: Tổng tiền cược thua - (Tổng tiền cược thắng × 0.8).
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={profitChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="profit" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Số Lệnh Cược</CardTitle>
              <p className="text-gray-300 text-sm">
                Số lệnh cược mỗi ngày. Tính bằng cách đếm số lệnh trong 24 giờ.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={tradeVolumeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="volume" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trades" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trades">Lệnh Cược</TabsTrigger>
            <TabsTrigger value="users">Người Chơi</TabsTrigger>
            <TabsTrigger value="transactions">Giao Dịch</TabsTrigger>
          </TabsList>

          {/* Tab Lệnh Cược */}
          <TabsContent value="trades">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Danh Sách Lệnh Cược</CardTitle>
                <p className="text-gray-300 text-sm">
                  Xem chi tiết cược của người chơi. Lãi/Lỗ: Thắng = Cược × 0.8, Thua = -Cược, Đang chờ = 0.
                </p>
                <div className="flex gap-4 mt-2">
                  <Select value={tradeFilter} onValueChange={(v) => setTradeFilter(v as "all" | "win" | "lose" | "pending")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Lọc trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="win">Thắng</SelectItem>
                      <SelectItem value="lose">Thua</SelectItem>
                      <SelectItem value="pending">Đang chờ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as "all" | "7days" | "30days")}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Lọc thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="7days">7 ngày</SelectItem>
                      <SelectItem value="30days">30 ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">STT</TableHead>
                        <TableHead className="text-white">Phiên</TableHead>
                        <TableHead className="text-white">Người Chơi</TableHead>
                        <TableHead className="text-white">Hướng Cược</TableHead>
                        <TableHead className="text-white">Số Tiền</TableHead>
                        <TableHead className="text-white">Trạng Thái</TableHead>
                        <TableHead className="text-white">Lãi/Lỗ</TableHead>
                        <TableHead className="text-white">Thời Gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-400">
                            Không có lệnh cược nào
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredHistory.slice(0, showMoreTrades ? undefined : 10).map((h, idx) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-white">{idx + 1}</TableCell>
                          <TableCell className="text-white">{h.session}</TableCell>
                          <TableCell className="text-white">
                            {users.find((u) => u.id === h.userId)?.username || h.userId}
                          </TableCell>
                          <TableCell>
                            <Badge variant={h.direction === "UP" ? "success" : "destructive"}>
                              {h.direction === "UP" ? "LÊN" : "XUỐNG"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{formatCurrency(h.amount)}</TableCell>
                          <TableCell>
                            {h.status === "pending" && (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                Đang chờ
                              </Badge>
                            )}
                            {h.status === "win" && <Badge variant="success">Thắng</Badge>}
                            {h.status === "lose" && <Badge variant="destructive">Thua</Badge>}
                          </TableCell>
                          <TableCell className="text-white">{formatCurrency(h.profit)}</TableCell>
                          <TableCell className="text-white">
                            {format(h.createdAt, "dd/MM/yyyy HH:mm:ss")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredHistory.length > 10 && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowMoreTrades(!showMoreTrades)}
                  >
                    {showMoreTrades ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Người Chơi */}
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Danh Sách Người Chơi</CardTitle>
                <p className="text-gray-300 text-sm">
                  Xem thông tin tài khoản. Số dư = Tiền nạp - Tiền rút + Lãi/Lỗ cược. Số dư âm được tô đỏ.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">STT</TableHead>
                        <TableHead className="text-white">Tên</TableHead>
                        <TableHead className="text-white">Số Dư</TableHead>
                        <TableHead className="text-white">Ngày Tạo</TableHead>
                        <TableHead className="text-white">Số Lệnh Cược</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400">
                            Không có người chơi nào
                          </TableCell>
                        </TableRow>
                      )}
                      {users.slice(0, showMoreUsers ? undefined : 10).map((u, idx) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-white">{idx + 1}</TableCell>
                          <TableCell className="text-white">{u.username}</TableCell>
                          <TableCell className={u.balance < 0 ? "text-red-400" : "text-white"}>
                            {formatCurrency(u.balance)}
                          </TableCell>
                          <TableCell className="text-white">
                            {format(u.createdAt, "dd/MM/yyyy HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-white">
                            {history.filter((h) => h.userId === u.id).length}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {users.length > 10 && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowMoreUsers(!showMoreUsers)}
                  >
                    {showMoreUsers ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Giao Dịch */}
          <TabsContent value="transactions">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Danh Sách Giao Dịch</CardTitle>
                <p className="text-gray-300 text-sm">
                  Xem lịch sử nạp/rút tiền. Giao dịch rút trên 1 triệu được tô đỏ.
                </p>
                <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as "all" | "7days" | "30days")}>
                  <SelectTrigger className="w-40 mt-2">
                    <SelectValue placeholder="Lọc thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="7days">7 ngày</SelectItem>
                    <SelectItem value="30days">30 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">STT</TableHead>
                        <TableHead className="text-white">Người Chơi</TableHead>
                        <TableHead className="text-white">Loại</TableHead>
                        <TableHead className="text-white">Số Tiền</TableHead>
                        <TableHead className="text-white">Thời Gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400">
                            Không có giao dịch nào
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredTransactions.slice(0, showMoreTransactions ? undefined : 10).map((t, idx) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-white">{idx + 1}</TableCell>
                          <TableCell className="text-white">
                            {users.find((u) => u.id === t.userId)?.username || t.userId}
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.type === "deposit" ? "success" : "destructive"}>
                              {t.type === "deposit" ? "Nạp" : "Rút"}
                            </Badge>
                          </TableCell>
                          <TableCell className={t.type === "withdraw" && t.amount > 1000000 ? "text-red-400" : "text-white"}>
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell className="text-white">
                            {format(t.createdAt, "dd/MM/yyyy HH:mm:ss")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredTransactions.length > 10 && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowMoreTransactions(!showMoreTransactions)}
                  >
                    {showMoreTransactions ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  tooltip?: string;
  formula?: string;
}

function StatCard({ label, value, className, tooltip, formula }: StatCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold text-white ${className ?? ""}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{formula}</p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
