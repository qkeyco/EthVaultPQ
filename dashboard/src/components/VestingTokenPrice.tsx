import { useState, useEffect, useRef } from 'react';

interface TokenPriceProps {
  tokenSymbol?: string;
  initialPriceUSD?: number;
  monthlyGrowthRate?: number; // percentage per month
  testMode?: boolean;
}

interface PriceData {
  usd: number;
  eth: number;
  btc: number;
  lastUpdate: Date;
}

interface PriceHistoryPoint {
  time: number; // minutes elapsed
  usd: number;
  eth: number;
  btc: number;
}

/**
 * VestingTokenPrice Component
 *
 * Shows the price of the vesting token in USD, ETH, and BTC
 * In test mode (1 min = 1 month), simulates price appreciation
 */
export function VestingTokenPrice({
  tokenSymbol = 'MQKEY',
  initialPriceUSD = 1.00,
  monthlyGrowthRate = 5, // 5% per month default
  testMode = true
}: TokenPriceProps) {
  const [priceData, setPriceData] = useState<PriceData>({
    usd: initialPriceUSD,
    eth: 0,
    btc: 0,
    lastUpdate: new Date()
  });
  const [ethPrice, setEthPrice] = useState<number>(3773.03); // Initialize with recent price
  const [btcPrice, setBtcPrice] = useState<number>(107643.28); // Initialize with recent price
  const [monthsElapsed, setMonthsElapsed] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);

  // Use ref to persist startTime across re-renders
  const startTimeRef = useRef<number>(Date.now());

  // Fetch ETH and BTC prices from Pyth
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        // Fetch ETH/USD
        const ethResponse = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
        );
        const ethData = await ethResponse.json();

        if (ethData.parsed && ethData.parsed[0]?.price) {
          const ethPriceValue = Number(ethData.parsed[0].price.price) * Math.pow(10, ethData.parsed[0].price.expo);
          console.log('Pyth ETH/USD:', ethPriceValue);
          setEthPrice(ethPriceValue);
        }

        // Fetch BTC/USD
        const btcResponse = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
        );
        const btcData = await btcResponse.json();

        if (btcData.parsed && btcData.parsed[0]?.price) {
          const btcPriceValue = Number(btcData.parsed[0].price.price) * Math.pow(10, btcData.parsed[0].price.expo);
          console.log('Pyth BTC/USD:', btcPriceValue);
          setBtcPrice(btcPriceValue);
        }
      } catch (err) {
        console.error('Failed to fetch crypto prices:', err);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Reset startTime when testMode changes
  useEffect(() => {
    if (testMode) {
      startTimeRef.current = Date.now();
      setMonthsElapsed(0);
      setPriceHistory([]);
    }
  }, [testMode, initialPriceUSD, monthlyGrowthRate]);

  // Simulate price appreciation in test mode
  useEffect(() => {
    if (!testMode) {
      // Production mode: price is static
      return;
    }

    const updatePrice = () => {
      const timeElapsedMs = Date.now() - startTimeRef.current;
      const secondsElapsed = timeElapsedMs / 1000;
      const months = Math.floor(secondsElapsed / 12); // In test mode: 12 seconds = 1 month (1 block)

      setMonthsElapsed(months);

      // Calculate appreciated price: P = P0 * (1 + r)^n
      const growthFactor = Math.pow(1 + monthlyGrowthRate / 100, months);
      const currentUSDPrice = initialPriceUSD * growthFactor;

      const newPriceData = {
        usd: currentUSDPrice,
        eth: ethPrice > 0 ? currentUSDPrice / ethPrice : 0,
        btc: btcPrice > 0 ? currentUSDPrice / btcPrice : 0,
        lastUpdate: new Date()
      };

      setPriceData(newPriceData);

      // Add to history every 12 seconds (every block/month)
      if (Math.floor(secondsElapsed / 12) !== Math.floor((secondsElapsed - 12) / 12)) {
        setPriceHistory(prev => {
          const newHistory = [...prev, {
            time: secondsElapsed / 60, // Convert to minutes for display
            usd: currentUSDPrice,
            eth: newPriceData.eth,
            btc: newPriceData.btc
          }];
          // Keep only last 60 points (60 months of history)
          return newHistory.slice(-60);
        });
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 1000); // Update every second for smooth display
    return () => clearInterval(interval);
    // Only depend on what triggers the timer, not crypto prices
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode, initialPriceUSD, monthlyGrowthRate]);

  // Production mode: static price
  useEffect(() => {
    if (testMode) return;

    setPriceData({
      usd: initialPriceUSD,
      eth: ethPrice > 0 ? initialPriceUSD / ethPrice : 0,
      btc: btcPrice > 0 ? initialPriceUSD / btcPrice : 0,
      lastUpdate: new Date()
    });
  }, [testMode, initialPriceUSD, ethPrice, btcPrice]);

  const formatPrice = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const formatCryptoPrice = (value: number): string => {
    if (value === 0) return '0.000000';
    if (value < 0.000001) return value.toExponential(2);
    return value.toFixed(6);
  };

  const priceChange = monthsElapsed > 0
    ? ((priceData.usd / initialPriceUSD - 1) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            {tokenSymbol} Token Price Simulator
            {testMode && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">
                ⚡ Test Mode: +{monthlyGrowthRate}%/month
              </span>
            )}
          </h3>
          <p className="text-sm text-indigo-700 mt-1 flex items-center gap-2">
            {testMode
              ? `Price appreciation simulator (${monthsElapsed} months elapsed)`
              : 'Live pricing'
            }
            <span className="text-xs">•</span>
            <span className="flex items-center gap-1">
              Powered by
              <a href="https://pyth.network" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                Pyth Network
              </a>
            </span>
          </p>
        </div>
        <img
          src="https://docs.pyth.network/img/logo.svg"
          alt="Pyth Network"
          className="h-8 opacity-80"
          title="Real-time price data from Pyth Network"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* USD Price */}
        <div className="bg-white rounded-lg p-4 border border-indigo-200">
          <div className="text-xs text-gray-600 mb-1">USD Price</div>
          <div className="text-2xl font-bold text-indigo-900">
            ${formatPrice(priceData.usd, 4)}
          </div>
          {testMode && monthsElapsed > 0 && (
            <div className={`text-xs mt-1 font-semibold ${
              parseFloat(priceChange) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseFloat(priceChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%
            </div>
          )}
        </div>

        {/* ETH Price */}
        <div className="bg-white rounded-lg p-4 border border-indigo-200">
          <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
            ETH Price
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
              PYTH
            </span>
          </div>
          <div className="text-lg font-bold text-indigo-900">
            {formatCryptoPrice(priceData.eth)} ETH
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ETH/USD: ${formatPrice(ethPrice, 2)}
          </div>
        </div>

        {/* BTC Price */}
        <div className="bg-white rounded-lg p-4 border border-indigo-200">
          <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
            BTC Price
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
              PYTH
            </span>
          </div>
          <div className="text-lg font-bold text-indigo-900">
            {formatCryptoPrice(priceData.btc)} BTC
          </div>
          <div className="text-xs text-gray-500 mt-1">
            BTC/USD: ${formatPrice(btcPrice, 2)}
          </div>
        </div>
      </div>

      {/* Price History Graph */}
      {testMode && priceHistory.length > 1 && (
        <div className="mt-6 bg-white rounded-lg p-4 border border-indigo-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Price History (USD)</h4>
          <div className="relative h-48">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />

              {/* Price line */}
              {(() => {
                const minPrice = Math.min(...priceHistory.map(p => p.usd));
                const maxPrice = Math.max(...priceHistory.map(p => p.usd));
                const priceRange = maxPrice - minPrice || 1;
                const points = priceHistory.map((point, i) => {
                  const x = (i / (priceHistory.length - 1)) * 100;
                  const y = 100 - ((point.usd - minPrice) / priceRange) * 100;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Current price dot */}
                    {priceHistory.length > 0 && (() => {
                      const lastPoint = priceHistory[priceHistory.length - 1];
                      const x = 100;
                      const y = 100 - ((lastPoint.usd - minPrice) / priceRange) * 100;
                      return (
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#6366f1"
                        />
                      );
                    })()}
                  </>
                );
              })()}
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 text-xs text-gray-500">
              ${formatPrice(Math.max(...priceHistory.map(p => p.usd)), 4)}
            </div>
            <div className="absolute left-0 bottom-0 text-xs text-gray-500">
              ${formatPrice(Math.min(...priceHistory.map(p => p.usd)), 4)}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 text-xs text-gray-500 -mb-5">
              {Math.floor(priceHistory[0]?.time || 0)}m
            </div>
            <div className="absolute bottom-0 right-0 text-xs text-gray-500 -mb-5">
              {Math.floor(priceHistory[priceHistory.length - 1]?.time || 0)}m
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6 text-center">
            Showing last {Math.floor((priceHistory.length * 10) / 60)} minutes of price data
          </p>
        </div>
      )}

      {testMode && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                How the Simulator Works:
              </p>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• <strong>Starting Price:</strong> ${initialPriceUSD.toFixed(2)} USD per {tokenSymbol}</li>
                <li>• <strong>Growth Rate:</strong> +{monthlyGrowthRate}% per month (simulated appreciation)</li>
                <li>• <strong>Test Mode:</strong> 1 real minute = 1 vesting month (accelerated time!)</li>
                <li>• <strong>Live Pyth Data:</strong> ETH/USD and BTC/USD rates update every 5 minutes</li>
                <li>• <strong>Watch it grow:</strong> Just wait and see the USD price increase each minute!</li>
              </ul>
              <p className="text-xs text-yellow-700 mt-2 italic">
                This demonstrates how your vesting tokens could appreciate over time, priced in multiple currencies using Pyth Network oracles.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        Last updated: {priceData.lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}
