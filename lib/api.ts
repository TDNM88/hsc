import axios from "axios"

const api = axios.create({ baseURL: "/api" })
const ALPHA_VANTAGE_API_KEY = 'EHXTVIOU7YN287DP' // In production, move this to environment variables

// User transactions
export const deposit = async (data: any) => {
  const response = await api.post("/deposits", data)
  return response.data
}

export const getDeposits = async (params: any) => {
  const response = await api.get("/deposits", { params })
  return response.data
}

export const withdraw = async (data: any) => {
  const response = await api.post("/withdraws", data)
  return response.data
}

export const getWithdraws = async (params: any) => {
  const response = await api.get("/withdraws", { params })
  return response.data
}

// Market Data API
export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  timestamp: string
}

export const getIntradayData = async (symbol: string = 'XAUUSD', interval: string = '1min'): Promise<MarketData> => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol.includes('/') ? `OANDA:${symbol}` : `OANDA:${symbol}_USD`,
        interval,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact',
        datatype: 'json'
      }
    })

    const timeSeries = response.data[`Time Series (${interval})`]
    if (!timeSeries) {
      throw new Error('No time series data found')
    }

    const timestamps = Object.keys(timeSeries).sort().reverse()
    const latest = timeSeries[timestamps[0]]
    const previous = timeSeries[timestamps[1]]
    
    const close = parseFloat(latest['4. close'])
    const prevClose = parseFloat(previous?.['4. close'] || latest['1. open'])
    const change = close - prevClose
    const changePercent = (change / prevClose) * 100

    return {
      symbol,
      price: close,
      change,
      changePercent,
      open: parseFloat(latest['1. open']),
      high: parseFloat(latest['2. high']),
      low: parseFloat(latest['3. low']),
      volume: parseFloat(latest['5. volume'] || '0'),
      timestamp: timestamps[0]
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    // Return mock data in case of error
    return {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: 0,
      timestamp: new Date().toISOString()
    }
  }
}

// Mock market data for fallback
const MOCK_MARKET_DATA: Record<string, MarketData> = {
  'XAU/USD': {
    symbol: 'XAU/USD',
    price: 2337.16,
    change: 12.5,
    changePercent: 0.54,
    open: 2324.66,
    high: 2340.22,
    low: 2320.10,
    volume: 0,
    timestamp: new Date().toISOString()
  },
  'OIL': {
    symbol: 'OIL',
    price: 85.20,
    change: -0.45,
    changePercent: -0.53,
    open: 85.65,
    high: 85.90,
    low: 84.80,
    volume: 0,
    timestamp: new Date().toISOString()
  },
  'S&P 500': {
    symbol: 'S&P 500',
    price: 5494.1,
    change: 24.3,
    changePercent: 0.44,
    open: 5469.8,
    high: 5501.2,
    low: 5465.3,
    volume: 0,
    timestamp: new Date().toISOString()
  }
}

export const getMarketData = async (symbols: string[] = ['XAU/USD', 'OIL', 'S&P 500']): Promise<MarketData[]> => {
  try {
    // First try to get real market data
    const results = await Promise.allSettled(
      symbols.map(symbol => {
        const symbolMap: Record<string, string> = {
          'XAU/USD': 'XAU',
          'OIL': 'CLF',
          'S&P 500': 'SPY',
          'BTC/USD': 'BTC',
          'ETH/USD': 'ETH'
        }
        
        const avSymbol = symbolMap[symbol] || symbol
        return getIntradayData(avSymbol, '5min')
      })
    )

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<MarketData> => 
        result.status === 'fulfilled' && result.value.price > 0
      )
      .map(result => result.value)

    // If we have successful results, return them
    if (successfulResults.length > 0) {
      return successfulResults
    }
    
    // Fallback to mock data if no successful API calls
    console.warn('Using mock market data - API rate limit may be reached')
    return symbols.map(symbol => ({
      ...(MOCK_MARKET_DATA[symbol] || {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        timestamp: new Date().toISOString()
      })
    }))
  } catch (error) {
    console.error('Error in getMarketData:', error)
    // Return mock data in case of error
    return symbols.map(symbol => ({
      ...(MOCK_MARKET_DATA[symbol] || {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        timestamp: new Date().toISOString()
      })
    }))
  }
}
