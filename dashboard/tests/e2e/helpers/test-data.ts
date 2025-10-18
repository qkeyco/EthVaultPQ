/**
 * Test data and constants for E2E tests
 */

export const TEST_ADDRESSES = {
  VALID_WALLET_1: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
  VALID_WALLET_2: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
  VALID_WALLET_3: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b',
  VALID_VAULT_1: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
  INVALID_ADDRESS: '0xinvalid',
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
};

export const TEST_VESTING_SCHEDULES = {
  SIMPLE_LINEAR: {
    preset: '60-Month Linear',
    mode: 'Test Mode',
    totalAmount: '1000000',
    cliffMonths: 0,
    vestingMonths: 60,
    recipients: [
      {
        address: TEST_ADDRESSES.VALID_WALLET_1,
        percentage: 100,
        isVault: false,
      },
    ],
  },

  WITH_CLIFF: {
    preset: '4-Year with 1-Year Cliff',
    mode: 'Production Mode',
    totalAmount: '5000000',
    cliffMonths: 12,
    vestingMonths: 48,
    recipients: [
      {
        address: TEST_ADDRESSES.VALID_WALLET_1,
        percentage: 100,
        isVault: false,
      },
    ],
  },

  MULTI_RECIPIENT: {
    preset: 'Custom Schedule',
    mode: 'Test Mode',
    totalAmount: '10000000',
    cliffMonths: 6,
    vestingMonths: 24,
    recipients: [
      {
        address: TEST_ADDRESSES.VALID_WALLET_1,
        percentage: 40,
        isVault: false,
      },
      {
        address: TEST_ADDRESSES.VALID_WALLET_2,
        percentage: 30,
        isVault: false,
      },
      {
        address: TEST_ADDRESSES.VALID_VAULT_1,
        percentage: 30,
        isVault: true,
      },
    ],
  },

  FAST_TEST: {
    preset: 'Custom Schedule',
    mode: 'Test Mode',
    totalAmount: '100000',
    cliffMonths: 0,
    vestingMonths: 5,
    recipients: [
      {
        address: TEST_ADDRESSES.VALID_WALLET_1,
        percentage: 100,
        isVault: false,
      },
    ],
  },
};

export const EXPECTED_BLOCK_CALCULATIONS = {
  TEST_MODE_MULTIPLIER: 60,
  ETHEREUM_BLOCK_TIME: 12, // seconds
  SECONDS_PER_MONTH: 30 * 24 * 60 * 60,

  // For 60-month linear in test mode
  LINEAR_60_MONTHS_TEST: {
    totalBlocks: 108000, // (60 months * 30 * 24 * 60 * 60) / 0.2
    durationMinutes: 60, // 60 months = 60 minutes in test mode
  },

  // For 4-year cliff in production
  CLIFF_4_YEAR_PROD: {
    cliffBlocks: 259200, // (12 months * 30 * 24 * 60 * 60) / 12
    totalBlocks: 1036800, // (48 months * 30 * 24 * 60 * 60) / 12
  },
};

export const SAMPLE_JSON_SCHEDULE = {
  version: '1.0.0',
  metadata: {
    name: 'Test Schedule',
    description: 'E2E test schedule',
    createdAt: new Date().toISOString(),
    tags: ['test'],
  },
  deployment: {
    network: 'tenderly' as const,
    tokenAddress: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
    tokenSymbol: 'MUSDC',
    tokenDecimals: 6,
  },
  schedule: {
    mode: 'test' as const,
    preset: 'custom' as const,
    totalAmount: '500000',
    startTime: {
      timestamp: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      isPastDated: false,
    },
    cliff: {
      durationMonths: 0,
      durationBlocks: 0,
      endTimestamp: new Date(Date.now() + 60000).toISOString(),
      endBlockNumber: 0,
    },
    vesting: {
      durationMonths: 10,
      durationBlocks: 18000,
      endTimestamp: new Date(Date.now() + 600000).toISOString(),
      endBlockNumber: 18000,
    },
    rate: {
      tokensPerBlock: '27.777778',
      tokensPerMonth: '50000.00',
      percentagePerMonth: 10.0,
    },
  },
  recipients: [
    {
      address: TEST_ADDRESSES.VALID_WALLET_1,
      percentage: 60,
      amount: '300000.00',
      isVault: false,
    },
    {
      address: TEST_ADDRESSES.VALID_WALLET_2,
      percentage: 40,
      amount: '200000.00',
      isVault: false,
    },
  ],
  security: {
    revocable: false,
    pausable: true,
    pqProtected: true,
  },
};

export const CONTRACT_NAMES = [
  'ZK Verifier',
  'PQ Validator',
  'PQ Wallet Factory',
  'Mock Token',
  'PQ Vault 4626',
  'PQ Vault Demo',
  'ZK Proof Oracle',
  'QRNG Oracle',
];

export const NETWORK_OPTIONS = [
  'Tenderly Ethereum',
  'Sepolia',
  'Ethereum Mainnet',
];

/**
 * Generate a future datetime string for datetime-local input
 */
export function getFutureDateTimeString(minutesFromNow: number = 1): string {
  const date = new Date(Date.now() + minutesFromNow * 60000);
  return date.toISOString().slice(0, 16);
}

/**
 * Generate a past datetime string for datetime-local input
 */
export function getPastDateTimeString(monthsAgo: number = 1): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toISOString().slice(0, 16);
}

/**
 * Calculate expected vesting rate
 */
export function calculateVestingRate(
  totalAmount: number,
  vestingMonths: number,
  cliffMonths: number,
  testMode: boolean = false
): {
  tokensPerMonth: number;
  percentagePerMonth: number;
  tokensPerBlock: number;
} {
  const activeVestingMonths = vestingMonths - cliffMonths;
  const tokensPerMonth = totalAmount / activeVestingMonths;
  const percentagePerMonth = (tokensPerMonth / totalAmount) * 100;

  const secondsPerMonth = 30 * 24 * 60 * 60;
  const blockTime = testMode ? 0.2 : 12; // Test mode: 60x faster
  const blocksPerMonth = secondsPerMonth / blockTime;
  const tokensPerBlock = tokensPerMonth / blocksPerMonth;

  return {
    tokensPerMonth,
    percentagePerMonth,
    tokensPerBlock,
  };
}
