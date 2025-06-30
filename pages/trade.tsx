"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMockUser, type User } from "@/lib/mock-user";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowUp, ArrowDown, Clock, BarChart2, DollarSign, RefreshCw, ChevronDown, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Layout from "../components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import TradingViewSymbolOverview from "../components/TradingViewSymbolOverview";
import TradingViewAdvancedChart from "../components/TradingViewAdvancedChart";
import LiquidityTable from "../components/LiquidityTable";
import TradingViewTickerTape from "@/components/TradingViewTickerTape";

// Constants
const QUICK_AMOUNTS = [100000, 1000000, 5000000, 10000000, 30000000, 50000000, 100000000, 200000000];
const TIME_FRAMES = [
  { value: "1", label: "1 phút" },
  { value: "5", label: "5 phút" },
  { value: "15", label: "15 phút" },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Trade = () => {
  const { toast } = useToast();
  const user = useMockUser();
  const [balance, setBalance] = useState<number>(user?.balance ?? 0);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState("1");

  // ---- Shared round countdown ----
  const { data: roundData } = useSWR<{ roundId: number; endTime: string }>("/api/rounds/current", fetcher, { refreshInterval: 5000 });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const sessionId = roundData?.roundId ?? 0;

  const [selectedAction, setSelectedAction] = useState<"UP" | "DOWN" | null>(null);
  const [marketData, setMarketData] = useState([
    { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
    { symbol: "OIL", price: 85.20, change: -0.45, changePercent: -0.53 },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTrade, setActiveTrade] = useState<{
    id: number;
    direction: "UP" | "DOWN";
    entryPrice: number;
    amount: number;
    endTime: number;
  } | null>(null);

  // Order panel helpers
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // countdown based on round endTime
  useEffect(() => {
    const timer = setInterval(() => {
      if (roundData?.endTime) {
        const diff = Math.max(0, Math.floor((new Date(roundData.endTime).getTime() - Date.now()) / 1000));
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [roundData]);

  const adjustAmount = (delta: number) => {
    setAmount((prev) => {
      const value = parseInt(prev || "0", 10);
      const newVal = Math.max(0, value + delta * 100000);
      return newVal.toString();
    });
  };

  const addAmount = (increment: number) => {
    setAmount((prev) => {
      const value = parseInt(prev.replace(/,/g, "") || "0", 10);
      return (value + increment).toString();
    });
  };

  const formatAmount = (val: string) => {
    if (!val) return "";
    return Number(val.replace(/,/g, "")).toLocaleString("en-US");
  };

  const [tradeResult, setTradeResult] = useState<{
    status: "idle" | "win" | "lose" | "processing";
    direction?: "UP" | "DOWN";
    entryPrice?: number;
    exitPrice?: number;
    amount?: number;
    profit?: number;
  }>({ status: "idle" });

  // --- Poll active trades when waiting for settlement ---
  const { data: activeTradesData } = useSWR(tradeResult.status === "processing" ? "/api/trades/active" : null, fetcher, { refreshInterval: 2000 });

  // trade history will be declared later with proper type

  useEffect(() => {
    if (timeLeft === 0 && selectedAction) {
      setTradeResult({ status: "processing" });
    }
  }, [timeLeft, selectedAction]);

  useEffect(() => {
    // when processing and no active trades -> settlement done
    if (tradeResult.status === "processing" && activeTradesData && activeTradesData.trades.length === 0) {
      // Refresh balance & history after round settled
      (async () => {
        try {
          const [balanceRes, historyRes] = await Promise.all([
            fetch("/api/users/me").then(r => r.json()),
            fetch("/api/trades/history?limit=20").then(r => r.json()),
          ]);
          if (balanceRes?.user) {
            setBalance(balanceRes.user.balance);
          }
          if (historyRes?.trades) {
            setTradeHistory(historyRes.trades);
          }
        } catch (err) {
          console.error("Failed to refresh after round", err);
        } finally {
          setTradeResult({ status: "idle" });
        }
      })();
    }
  }, [activeTradesData, tradeResult]);

  // ----- Trade history -----
  interface TradeHistoryRecord {
    id: number; // unique identifier
    session: number;
    direction: "UP" | "DOWN";
    amount: number;
    status: "pending" | "win" | "lose";
    profit: number;
  }
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryRecord[]>([]);
  const addPendingHistory = (record: TradeHistoryRecord) => setTradeHistory(prev => [...prev, record]);
  const updateHistoryStatus = (id: number, status: "win" | "lose", profit: number) =>
    setTradeHistory(prev => prev.map(r => r.id === id ? { ...r, status, profit } : r));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Giả lập dữ liệu từ MarketDataTicker
        setMarketData([
          { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
          { symbol: "OIL", price: 85.20, change: -0.45, changePercent: -0.53 },
        ]);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu thị trường",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [toast]);

  useEffect(() => {
    if (!activeTrade) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const timeRemaining = Math.ceil((activeTrade.endTime - now) / 1000);
      if (timeRemaining <= 0) {
        const currentPrice = marketData.find(md => md.symbol === "XAU/USD")?.price || 0;
        const isWin = activeTrade.direction === "UP"
          ? currentPrice > activeTrade.entryPrice
          : currentPrice < activeTrade.entryPrice;
        const profit = isWin ? activeTrade.amount * 0.8 : -activeTrade.amount;
        setTradeResult({
          status: isWin ? "win" : "lose",
          direction: activeTrade.direction,
          entryPrice: activeTrade.entryPrice,
          exitPrice: currentPrice,
          amount: activeTrade.amount,
          profit,
        });
        // Add to history
        updateHistoryStatus(activeTrade.id, isWin ? "win" : "lose", profit);
        if (isWin) {
          setBalance(prev => prev + activeTrade.amount + profit);
        } else {
          setBalance(prev => prev - activeTrade.amount);
        }
        setActiveTrade(null);
        clearInterval(timer);
        setTimeout(() => setTradeResult(prev => ({ ...prev, status: "idle" })), 5000);
      } else {
        // keep trade-specific countdown separate if needed, do not override global round timer
        // setTimeLeft(timeRemaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTrade, marketData]);

  useEffect(() => {
    if (user === null) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/trade')}`);
    }
  }, [user, router]);

  const handleAction = (direction: "UP" | "DOWN") => {
    const betAmount = Number(amount.replace(/,/g, ""));
    if (!betAmount || isNaN(betAmount)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số tiền hợp lệ" });
      return;
    }
    if (betAmount < 100000) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số tiền tối thiểu là 100,000 VND" });
      return;
    }
    if (user && betAmount > (user.balance || 0)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số dư không đủ" });
      return;
    }
    setSelectedAction(direction);
    setIsConfirming(true);
  };

  const confirmTrade = () => {
    if (!selectedAction) return;
    const entryPrice = marketData.find(md => md.symbol === "XAU/USD")?.price || 0;
    const tradeAmount = Number(amount.replace(/,/g, ""));
    const tradeId = Date.now();
    setBalance(prev => prev - tradeAmount);
    // add pending record to history
    addPendingHistory({ id: tradeId, session: sessionId, direction: selectedAction, amount: tradeAmount, status: "pending", profit: 0 });

    setActiveTrade({
      id: tradeId,
      direction: selectedAction,
      entryPrice,
      amount: tradeAmount,
      endTime: Date.now() + (parseInt(timeFrame) * 60 * 1000),
    });
    setIsConfirming(false);
    setSelectedAction(null);
    setAmount("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleAmountClick = (value: number) => {
    setAmount(value.toString());
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Đang tải...</span>
      </div>
    );
  }

  return (
    <Layout title="Giao dịch - London SSI">
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <Dialog
          open={tradeResult.status === "win" || tradeResult.status === "lose"}
          onOpenChange={(open) => !open && setTradeResult(prev => ({ ...prev, status: "idle" }))}
        >
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-green-500">
            <DialogHeader>
              <DialogTitle className={`text-2xl text-center ${
                tradeResult.status === "win" ? "text-green-500" : "text-red-500"
              }`}>
                {tradeResult.status === "win" ? "Chúc mừng bạn đã thắng!" : "Rất tiếc, bạn đã thua"}
              </DialogTitle>
              <DialogDescription className="text-center text-white">
                {tradeResult.profit && tradeResult.profit > 0 ? "+" : ""}
                {tradeResult.profit ? formatCurrency(tradeResult.profit) : 0} VND
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400">Lệnh:</div>
                <div className="text-white">
                  {tradeResult.direction === "UP" ? "LÊN" : "XUỐNG"}
                </div>
                <div className="text-gray-400">Giá vào:</div>
                <div className="text-white">{tradeResult.entryPrice?.toFixed(2)}</div>
                <div className="text-gray-400">Giá đóng:</div>
                <div className="text-white">{tradeResult.exitPrice?.toFixed(2)}</div>
                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">
                  {tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
                </div>
                <div className="text-gray-400">Lợi nhuận:</div>
                <div className={`font-bold ${
                  (tradeResult.profit || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {tradeResult.profit && tradeResult.profit > 0 ? "+" : ""}
                  {tradeResult.profit ? formatCurrency(tradeResult.profit) : 0} VND
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setTradeResult({ status: "idle" })}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800">
            <DialogHeader className="flex items-center justify-center">
              <DialogTitle className="text-white text-center">Phiên hiện tại <span className="text-red-500">{sessionId}</span></DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-300 text-center">
              XÁC NHẬN
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setIsConfirming(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className={`flex-1 ${
                  selectedAction === "UP" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={confirmTrade}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 1/3 width */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border border-gray-300 rounded-md shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ChevronDown className="h-4 w-4 text-gray-700" />
                  <CardTitle className="text-gray-900 text-base font-medium">Số dư</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="py-6 px-4">
                <div className="flex items-center justify-between text-gray-900 text-lg font-semibold uppercase">
                  <span>SỐ DƯ:</span>
                  <span>{formatCurrency(balance)} VND</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-300 rounded-md shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ChevronDown className="h-4 w-4 text-gray-700" />
                  <CardTitle className="text-gray-900 text-base font-medium">Đặt lệnh</CardTitle>
                  <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded ml-auto">ID: {sessionId}</span>
                </div>
              </CardHeader>
              <CardContent>  
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="amount" className="text-sm text-gray-400">
                      Số tiền (VND)
                    </label>
                    <span className="text-xs text-gray-400">Tối thiểu: {formatCurrency(100000)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => addAmount(-100000)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="amount"
                      type="text"
                      value={formatAmount(amount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");
                        if (/^\d*$/.test(raw)) setAmount(raw);
                      }}
                      placeholder="Nhập số tiền"
                    />
                    <Button variant="outline" size="icon" onClick={() => addAmount(100000)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {QUICK_AMOUNTS.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-sm font-semibold bg-white hover:bg-gray-100"
                        onClick={() => addAmount(value)}
                      >
                        {value >= 1000000 ? `+${value / 1000000}M` : `+${value / 1000}K`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 mb-4 text-sm text-gray-900">
                  <div className="flex justify-between"><span>Ngày:</span><span>{new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span>Giờ:</span><span>{new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                  <div className="flex justify-between font-semibold"><span>Phiên hiện tại:</span><span>{sessionId}</span></div>
                </div>
                <div className="mb-4">
                  <div className="border border-red-600 rounded bg-gray-100 text-center py-3 text-sm text-gray-900">
                    Hãy đặt lệnh: <span className="font-bold text-red-600">{String(timeLeft).padStart(2, '0')}s</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("UP")}
                    disabled={isLoading || !amount}
                  >
                    LÊN <ArrowUp className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("DOWN")}
                    disabled={isLoading || !amount}
                  >
                    XUỐNG <ArrowDown className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-300">
              <CardHeader>
                <CardTitle className="text-gray-900">Cập nhật</CardTitle>
              </CardHeader>
              <CardContent>
                <LiquidityTable />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 2/3 width */}
          <div className="lg:col-span-8 space-y-6">
            {/* Market Data Ticker */}
              <TradingViewTickerTape />
            <Card className="bg-white border-gray-300 h-[650px] overflow-hidden">
              <CardContent className="h-full w-full p-0">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <TradingViewAdvancedChart symbol="TVC:GOLD" interval="1" theme="dark" height={460} interactive={false} />
                )}
              </CardContent>
            </Card>

            {/* ----- History ----- */}
            <Card className="relative z-10 bg-white border-gray-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-900">Lịch sử lệnh</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300 text-sm text-left text-gray-900">
                    <thead className="bg-gray-100 uppercase text-gray-600">
                      <tr>
                        <th scope="col" className="px-4 py-2 font-medium">Phiên</th>
                        <th scope="col" className="px-4 py-2 font-medium">Loại</th>
                        <th scope="col" className="px-4 py-2 font-medium">Số tiền</th>
                        <th scope="col" className="px-4 py-2 font-medium">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <BarChart2 className="w-8 h-8 mb-2" />
                              <p>Chưa có dữ liệu</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tradeHistory.map((rec, idx) => (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">{rec.session}</td>
                            <td className={`px-4 py-2 font-semibold ${rec.direction === 'UP' ? 'text-green-600' : 'text-red-600'}`}>{rec.direction === 'UP' ? 'LÊN' : 'XUỐNG'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(rec.amount)} VND</td>
                            <td className={`px-4 py-2 font-semibold ${rec.status === 'pending' ? 'text-gray-500' : rec.status === 'win' ? 'text-green-600' : 'text-red-600'}`}>{rec.status === 'pending' ? 'Đợi kết quả' : rec.status === 'win' ? 'Thắng' : 'Thua'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ----- Liquidity / Market Overview ----- */}
            <Card className="bg-white border-gray-300">
              <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-900">Thanh khoản</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LiquidityTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Trade;
