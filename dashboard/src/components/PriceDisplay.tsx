import { useState, useEffect } from 'react';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

interface PriceData {
  price: string;
  confidence: string;
  expo: number;
  publishTime: number;
}

interface PriceDisplayProps {
  symbol: string;
  priceId: string;
  label?: string;
  showConfidence?: boolean;
}

// Initialize Pyth connection (Hermes stable endpoint)
const pythConnection = new EvmPriceServiceConnection(
  'https://hermes.pyth.network'
);

/**
 * PriceDisplay Component
 *
 * Displays real-time token prices from Pyth Network
 * Prize Eligibility: Pyth Network Integration
 */
export function PriceDisplay({
  symbol,
  priceId,
  label,
  showConfidence = false
}: PriceDisplayProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        setLoading(true);

        // Fetch latest price feeds from Pyth
        const priceFeeds = await pythConnection.getLatestPriceFeeds([priceId]);

        if (!isMounted) return;

        if (!priceFeeds || priceFeeds.length === 0) {
          throw new Error(`No price data found for ${symbol}`);
        }

        const priceFeed = priceFeeds[0];
        const price = priceFeed.getPriceUnchecked();

        setPriceData({
          price: price.price,
          confidence: price.conf,
          expo: price.expo,
          publishTime: price.publishTime,
        });
        setError(null);
      } catch (err) {
        console.error(`Error fetching price for ${symbol}:`, err);
        if (isMounted) {
          setError(`Unable to fetch ${symbol} price`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchPrice();

    // Poll for updates every 5 seconds
    intervalId = setInterval(fetchPrice, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [priceId, symbol]);

  const formatPrice = (price: string, expo: number): string => {
    const numPrice = Number(price) * Math.pow(10, expo);
    return numPrice.toFixed(Math.abs(expo));
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  const getAgeColor = (timestamp: number): string => {
    const ageSeconds = Date.now() / 1000 - timestamp;
    if (ageSeconds < 60) return 'text-green-600';
    if (ageSeconds < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !priceData) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600">Loading {symbol} price...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-600 text-sm">⚠️ {error}</span>
        </div>
      </div>
    );
  }

  if (!priceData) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-600">
              {label || `${symbol} Price`}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              Pyth
            </span>
          </div>

          <div className="mt-1 flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">
              ${formatPrice(priceData.price, priceData.expo)}
            </p>
            {loading && (
              <span className="text-xs text-gray-500 animate-pulse">
                Updating...
              </span>
            )}
          </div>

          {showConfidence && (
            <p className="text-xs text-gray-500 mt-1">
              ± ${formatPrice(priceData.confidence, priceData.expo)} confidence
            </p>
          )}

          <p className={`text-xs mt-1 ${getAgeColor(priceData.publishTime)}`}>
            Updated: {formatTimestamp(priceData.publishTime)}
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Multi-Token Price Grid
 */
interface Token {
  symbol: string;
  priceId: string;
  label: string;
}

export function PriceGrid({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <PriceDisplay
          key={token.priceId}
          symbol={token.symbol}
          priceId={token.priceId}
          label={token.label}
          showConfidence={false}
        />
      ))}
    </div>
  );
}
