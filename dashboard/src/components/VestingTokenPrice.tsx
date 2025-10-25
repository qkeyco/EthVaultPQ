import { useState, useEffect } from 'react';

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

/**
 * VestingTokenPrice Component
 *
 * Shows the price of the vesting token in USD, ETH, and BTC
 * In test mode (1 min = 1 month), simulates price appreciation
 */
export function VestingTokenPrice({
  tokenSymbol = 'MUSDC',
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
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [monthsElapsed, setMonthsElapsed] = useState<number>(0);

  // Fetch ETH and BTC prices from Pyth
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        // Fetch ETH/USD
        const ethResponse = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
        );
        const ethData = await ethResponse.json();
        const ethPriceValue = Number(ethData.parsed[0].price.price) * Math.pow(10, ethData.parsed[0].price.expo);
        setEthPrice(ethPriceValue);

        // Fetch BTC/USD
        const btcResponse = await fetch(
          'https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
        );
        const btcData = await btcResponse.json();
        const btcPriceValue = Number(btcData.parsed[0].price.price) * Math.pow(10, btcData.parsed[0].price.expo);
        setBtcPrice(btcPriceValue);
      } catch (err) {
        console.error('Failed to fetch crypto prices:', err);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Simulate price appreciation in test mode
  useEffect(() => {
    if (!testMode) {
      // Production mode: price is static
      return;
    }

    const startTime = Date.now();

    const updatePrice = () => {
      const timeElapsedMs = Date.now() - startTime;
      const minutesElapsed = timeElapsedMs / 1000 / 60;
      const months = Math.floor(minutesElapsed); // In test mode: 1 minute = 1 month

      setMonthsElapsed(months);

      // Calculate appreciated price: P = P0 * (1 + r)^n
      const growthFactor = Math.pow(1 + monthlyGrowthRate / 100, months);
      const currentUSDPrice = initialPriceUSD * growthFactor;

      setPriceData({
        usd: currentUSDPrice,
        eth: ethPrice > 0 ? currentUSDPrice / ethPrice : 0,
        btc: btcPrice > 0 ? currentUSDPrice / btcPrice : 0,
        lastUpdate: new Date()
      });
    };

    updatePrice();
    const interval = setInterval(updatePrice, 1000); // Update every second
    return () => clearInterval(interval);
  }, [testMode, initialPriceUSD, monthlyGrowthRate, ethPrice, btcPrice]);

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
        <div>
          <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            {tokenSymbol} Token Price
            {testMode && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">
                ⚡ Test Mode: +{monthlyGrowthRate}%/month
              </span>
            )}
          </h3>
          <p className="text-sm text-indigo-700 mt-1">
            {testMode
              ? `Simulated appreciation (${monthsElapsed} months elapsed)`
              : 'Live pricing using Pyth Network'
            }
          </p>
        </div>
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
          <div className="text-xs text-gray-600 mb-1">ETH Price</div>
          <div className="text-lg font-bold text-indigo-900">
            {formatCryptoPrice(priceData.eth)} ETH
          </div>
          <div className="text-xs text-gray-500 mt-1">
            via Pyth: ${formatPrice(ethPrice, 2)}
          </div>
        </div>

        {/* BTC Price */}
        <div className="bg-white rounded-lg p-4 border border-indigo-200">
          <div className="text-xs text-gray-600 mb-1">BTC Price</div>
          <div className="text-lg font-bold text-indigo-900">
            {formatCryptoPrice(priceData.btc)} BTC
          </div>
          <div className="text-xs text-gray-500 mt-1">
            via Pyth: ${formatPrice(btcPrice, 2)}
          </div>
        </div>
      </div>

      {testMode && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Test Mode Simulation:</strong> Token starts at ${initialPriceUSD.toFixed(2)} and appreciates
            {monthlyGrowthRate}% per month. In test mode, 1 minute = 1 month, so you can see price growth in real-time!
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        Last updated: {priceData.lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}
