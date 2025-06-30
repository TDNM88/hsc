"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowUp, ArrowDown, BarChart2, ChevronDown, Plus, Minus } from "lucide-react"
import { useRouter } from "next/router"
import useSWR from "swr"
import Layout from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import TradingViewAdvancedChart from "../components/TradingViewAdvancedChart"
import LiquidityTable from "../components/LiquidityTable"
import TradingViewTickerTape from "@/components/TradingViewTickerTape"

// Constants
const QUICK_AMOUNTS = [100000, 1000000, 5000000, 10000000, 30000000, 50000000, 100000000, 200000000]
const TIME_FRAMES = [
  { value: "1", label: "1 phút" },
  { value: "5", label: "5 phút" },
  { value: "15", label: "15 phút" },
]

const fetcher = (url: string) => {
  const token = localStorage.getItem("token")
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}

const Trade = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [amount, setAmount] = useState<string>("")
  const [timeFrame, setTimeFrame] = useState("1")

  // ---- Shared round countdown ----
  const { data: roundData } = useSWR<{ roundId: number; endTime: string }>("/api/rounds/current", fetcher, {
    refreshInterval: 5000,
  })
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const sessionId = roundData?.roundId ?? 0

  const [selectedAction, setSelectedAction] = useState<"up" | "down" | null>(null)
  const [marketData, setMarketData] = useState([
    { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
    { symbol: "OIL", price: 85.2, change: -0.45, changePercent: -0.53 },
  ])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Order panel helpers
  const [currentTime, setCurrentTime] = useState(new Date())

  // Trade history
  const { data: tradeHistoryData, mutate: mutateTradeHistory } = useSWR("/api/trades/history?limit=10", fetcher, {
    refreshInterval: 10000,
  })
  const { data: activeTradesData, mutate: mutateActiveTrades } = useSWR("/api/trades/active", fetcher, {
    refreshInterval: 2000,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Update balance when user data changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0)
    }
  }, [user])

  // countdown based on round endTime
  useEffect(() => {
    const timer = setInterval(() => {
      if (roundData?.endTime) {
        const diff = Math.max(0, Math.floor((new Date(roundData.endTime).getTime() - Date.now()) / 1000))
        setTimeLeft(diff)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [roundData])

  const adjustAmount = (delta: number) => {
    setAmount((prev) => {
      const value = Number.parseInt(prev || "0", 10)
      const newVal = Math.max(0, value + delta * 100000)
      return newVal.toString()
    })
  }

  const addAmount = (increment: number) => {
    setAmount((prev) => {
      const value = Number.parseInt(prev.replace(/,/g, "") || "0", 10)
      return (value + increment).toString()
    })
  }

  const formatAmount = (val: string) => {
    if (!val) return ""
    return Number(val.replace(/,/g, "")).toLocaleString("en-US")
  }

  const [tradeResult, setTradeResult] = useState<{
    status: "idle" | "win" | "lose" | "processing"
    direction?: "up" | "down"
    entryPrice?: number
    exitPrice?: number
    amount?: number
    profit?: number
  }>({ status: "idle" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate market data from MarketDataTicker
        setMarketData([
          { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
          { symbol: "OIL", price: 85.2, change: -0.45, changePercent: -0.53 },
        ])
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error fetching market data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu thị trường",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [toast])

  useEffect(() => {
    if (!user) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/trade")}`)
    }
  }, [user, router])

  const handleAction = async (direction: "up" | "down") => {
    const betAmount = Number(amount.replace(/,/g, ""))
    if (!betAmount || isNaN(betAmount)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số tiền hợp lệ" })
      return
    }
    if (betAmount < 100000) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số tiền tối thiểu là 100,000 VND" })
      return
    }
    if (betAmount > balance) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số dư không đủ" })
      return
    }
    setSelectedAction(direction)
    setIsConfirming(true)
  }

  const confirmTrade = async () => {
    if (!selectedAction) return

    try {
      const tradeAmount = Number(amount.replace(/,/g, ""))
      const token = localStorage.getItem("token")

      const response = await fetch("/api/trades/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: "XAU/USD",
          amount: tradeAmount,
          direction: selectedAction,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đặt lệnh thành công",
        })

        // Update balance
        setBalance((prev) => prev - tradeAmount)

        // Refresh active trades and history
        mutateActiveTrades()
        mutateTradeHistory()

        setIsConfirming(false)
        setSelectedAction(null)
        setAmount("")
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: result.error || "Không thể đặt lệnh",
        })
      }
    } catch (error) {
      console.error("Trade error:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đặt lệnh",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value)
  }

  const handleAmountClick = (value: number) => {
    setAmount(value.toString())
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Đang tải...</span>
      </div>
    )
  }

  return (
    <Layout title="Giao dịch - London SSI">
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800">
            <DialogHeader className="flex items-center justify-center">
              <DialogTitle className="text-white text-center">
                Phiên hiện tại <span className="text-red-500">{sessionId}</span>
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-300 text-center">XÁC NHẬN</DialogDescription>
            <div className="py-4">
              <div className="text-center text-white">
                <p>
                  Bạn muốn đặt lệnh{" "}
                  <span className={selectedAction === "up" ? "text-green-500" : "text-red-500"}>
                    {selectedAction === "up" ? "LÊN" : "XUỐNG"}
                  </span>
                </p>
                <p>
                  Số tiền: <span className="font-bold">{formatCurrency(Number(amount.replace(/,/g, "")))}</span> VND
                </p>
              </div>
            </div>
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
                  selectedAction === "up" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
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
                  <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded ml-auto">
                    ID: {sessionId}
                  </span>
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
                        const raw = e.target.value.replace(/,/g, "")
                        if (/^\d*$/.test(raw)) setAmount(raw)
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
                  <div className="flex justify-between">
                    <span>Ngày:</span>
                    <span>
                      {new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giờ:</span>
                    <span>
                      {new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Phiên hiện tại:</span>
                    <span>{sessionId}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="border border-red-600 rounded bg-gray-100 text-center py-3 text-sm text-gray-900">
                    Hãy đặt lệnh: <span className="font-bold text-red-600">{String(timeLeft).padStart(2, "0")}s</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("up")}
                    disabled={isLoading || !amount || timeLeft < 5}
                  >
                    LÊN <ArrowUp className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("down")}
                    disabled={isLoading || !amount || timeLeft < 5}
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
                  <TradingViewAdvancedChart
                    symbol="TVC:GOLD"
                    interval="1"
                    theme="dark"
                    height={460}
                    interactive={false}
                  />
                )}
              </CardContent>
            </Card>

            {/* Active Trades */}
            {activeTradesData?.trades && activeTradesData.trades.length > 0 && (
              <Card className="bg-white border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-900">Lệnh đang chờ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 text-sm text-left text-gray-900">
                      <thead className="bg-gray-100 uppercase text-gray-600">
                        <tr>
                          <th scope="col" className="px-4 py-2 font-medium">
                            Phiên
                          </th>
                          <th scope="col" className="px-4 py-2 font-medium">
                            Loại
                          </th>
                          <th scope="col" className="px-4 py-2 font-medium">
                            Số tiền
                          </th>
                          <th scope="col" className="px-4 py-2 font-medium">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTradesData.trades.map((trade: any) => (
                          <tr key={trade.id} className="odd:bg-white even:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">{trade.roundId}</td>
                            <td
                              className={`px-4 py-2 font-semibold ${trade.direction === "up" ? "text-green-600" : "text-red-600"}`}
                            >
                              {trade.direction === "up" ? "LÊN" : "XUỐNG"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(trade.amount)} VND</td>
                            <td className="px-4 py-2 font-semibold text-orange-600">Đang chờ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trade History */}
            <Card className="relative z-10 bg-white border-gray-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-900">Lịch sử lệnh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300 text-sm text-left text-gray-900">
                    <thead className="bg-gray-100 uppercase text-gray-600">
                      <tr>
                        <th scope="col" className="px-4 py-2 font-medium">
                          Phiên
                        </th>
                        <th scope="col" className="px-4 py-2 font-medium">
                          Loại
                        </th>
                        <th scope="col" className="px-4 py-2 font-medium">
                          Số tiền
                        </th>
                        <th scope="col" className="px-4 py-2 font-medium">
                          Kết quả
                        </th>
                        <th scope="col" className="px-4 py-2 font-medium">
                          Lợi nhuận
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!tradeHistoryData?.trades || tradeHistoryData.trades.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <BarChart2 className="w-8 h-8 mb-2" />
                              <p>Chưa có dữ liệu</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tradeHistoryData.trades.map((trade: any) => (
                          <tr key={trade.id} className="odd:bg-white even:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">{trade.session}</td>
                            <td
                              className={`px-4 py-2 font-semibold ${trade.direction === "up" ? "text-green-600" : "text-red-600"}`}
                            >
                              {trade.direction === "up" ? "LÊN" : "XUỐNG"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(trade.amount)} VND</td>
                            <td
                              className={`px-4 py-2 font-semibold ${
                                trade.status === "pending"
                                  ? "text-orange-600"
                                  : trade.status === "won"
                                    ? "text-green-600"
                                    : "text-red-600"
                              }`}
                            >
                              {trade.status === "pending" ? "Đợi kết quả" : trade.status === "won" ? "Thắng" : "Thua"}
                            </td>
                            <td
                              className={`px-4 py-2 font-semibold ${trade.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {trade.profit > 0 ? "+" : ""}
                              {formatCurrency(trade.profit)} VND
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Liquidity / Market Overview */}
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
  )
}

export default Trade
