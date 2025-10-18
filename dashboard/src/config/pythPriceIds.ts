/**
 * Pyth Network Price Feed IDs
 *
 * These are the official Pyth price feed IDs for various tokens
 * Find more at: https://pyth.network/price-feeds
 *
 * Prize Eligibility: Pyth Network Integration
 */

export const PYTH_PRICE_IDS = {
  // Crypto Major Pairs (USD)
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  USDT_USD: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  DAI_USD: '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',

  // DeFi Tokens
  UNI_USD: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  AAVE_USD: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  LINK_USD: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  MKR_USD: '0x9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378',
  CRV_USD: '0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8',

  // Stablecoins
  FRAX_USD: '0x83a93d341e46d17e61b96145b0a76068e7be852ced50fb55dea13e5b82d5b65e',
  BUSD_USD: '0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814',
  PYUSD_USD: '0x492e751d61c10d95575377a2f4e0e69b39ccdda55c2c7f0c8e0d4950a50df141', // PayPal USD

  // Layer 2 & Scaling
  MATIC_USD: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
  OP_USD: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
  ARB_USD: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',

  // Others
  WBTC_USD: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
  stETH_USD: '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5',
} as const;

export type PythPriceId = typeof PYTH_PRICE_IDS[keyof typeof PYTH_PRICE_IDS];

/**
 * Common token configurations for price display
 */
export const COMMON_TOKENS = [
  {
    symbol: 'ETH',
    priceId: PYTH_PRICE_IDS.ETH_USD,
    label: 'Ethereum',
    decimals: 18,
  },
  {
    symbol: 'BTC',
    priceId: PYTH_PRICE_IDS.BTC_USD,
    label: 'Bitcoin',
    decimals: 8,
  },
  {
    symbol: 'PYUSD',
    priceId: PYTH_PRICE_IDS.PYUSD_USD,
    label: 'PayPal USD',
    decimals: 6,
  },
  {
    symbol: 'USDC',
    priceId: PYTH_PRICE_IDS.USDC_USD,
    label: 'USD Coin',
    decimals: 6,
  },
  {
    symbol: 'USDT',
    priceId: PYTH_PRICE_IDS.USDT_USD,
    label: 'Tether',
    decimals: 6,
  },
  {
    symbol: 'DAI',
    priceId: PYTH_PRICE_IDS.DAI_USD,
    label: 'Dai Stablecoin',
    decimals: 18,
  },
] as const;

/**
 * Get price ID for a token symbol
 */
export function getPriceId(symbol: string): string | undefined {
  const key = `${symbol.toUpperCase()}_USD` as keyof typeof PYTH_PRICE_IDS;
  return PYTH_PRICE_IDS[key];
}

/**
 * Pyth Hermes API endpoints
 */
export const PYTH_ENDPOINTS = {
  MAINNET: 'https://hermes.pyth.network',
  TESTNET: 'https://hermes-beta.pyth.network',
} as const;
