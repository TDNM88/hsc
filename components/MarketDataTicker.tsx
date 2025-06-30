'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketDataTicker = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    { symbol: 'XAU/USD', price: 2337.16, change: 12.5, changePercent: 0.54 },
    { symbol: 'OIL', price: 85.20, change: -0.45, changePercent: -0.53 },
    { symbol: 'S&P 500', price: 5494.1, change: 24.3, changePercent: 0.44 },
    { symbol: 'EUR/USD', price: 1.0724, change: 0.0024, changePercent: 0.22 },
    { symbol: 'BTC/USD', price: 61245.50, change: 1245.30, changePercent: 2.08 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData => 
        prevData.map(item => ({
          ...item,
          price: Number((item.price * (1 + (Math.random() * 0.002 - 0.001))).toFixed(2)),
          change: Number((item.change + (Math.random() * 0.5 - 0.25)).toFixed(2)),
          changePercent: Number((item.changePercent + (Math.random() * 0.1 - 0.05)).toFixed(2))
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white py-2 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center space-x-8 overflow-x-auto hide-scrollbar py-2">
          {marketData.map((item, index) => (
            <motion.div
              key={item.symbol}
              className="flex items-center space-x-4 whitespace-nowrap px-4 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-gray-600 font-medium">{item.symbol}</span>
              <span className="text-gray-900 font-bold">
                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MarketDataTicker;
