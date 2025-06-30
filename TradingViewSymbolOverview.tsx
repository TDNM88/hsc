'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewSymbolOverviewProps { height?: number; width?: string | number; }

function TradingViewSymbolOverview({ height = 500, width = '100%' }: TradingViewSymbolOverviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget if exists
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        ['SPXUSD', 'SPXUSD|1D'],
        ['NSXUSD', 'NSXUSD|1D'],
        ['DJI', 'DJI|1D'],
      ],
      chartType: 'area',
      colorTheme: 'light',
      autosize: false,
      height: height,
      width: width,
      locale: 'en',
      lineWidth: 2,
      showVolume: true,
      dateRanges: ['1d|1','1m|30','3m|60','12m|1D','5y|1W','all|1M'],
    });
    
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width, height }}>
      <div className="tradingview-widget-container__widget" style={{ width, height }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewSymbolOverview);
