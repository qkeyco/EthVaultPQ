import { useState, useEffect } from 'react';

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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from Pyth Hermes API
      const response = await fetch(
        `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${priceId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status}`);
      }

      const data = await response.json();

      if (!data.parsed || data.parsed.length === 0) {
        throw new Error('No price data available');
      }

      const priceInfo = data.parsed[0].price;

      setPriceData({
        price: priceInfo.price,
        confidence: priceInfo.conf,
        expo: priceInfo.expo,
        publishTime: priceInfo.publish_time,
      });
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Pyth price fetch error:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch once on mount
    fetchPrice();

    // Refresh every 5 minutes (300000ms)
    const interval = setInterval(fetchPrice, 300000);
    return () => clearInterval(interval);
  }, [priceId]);

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
        <div className="flex flex-col space-y-1">
          <span className="text-red-600 text-sm font-medium">⚠️ {symbol} Price Error</span>
          <span className="text-red-500 text-xs">{error}</span>
          <span className="text-gray-500 text-xs">Price ID: {priceId.slice(0, 10)}...</span>
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
            Pyth: {formatTimestamp(priceData.publishTime)}
          </p>
          {lastUpdate && (
            <p className="text-xs text-gray-500">
              Refreshed: {Math.floor((Date.now() - lastUpdate.getTime()) / 1000 / 60)}m ago
            </p>
          )}
        </div>

        {/* Refresh button */}
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={fetchPrice}
            disabled={loading}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            title="Manually refresh price"
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
          <span className="text-xs text-gray-500">Auto: 5m</span>
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
