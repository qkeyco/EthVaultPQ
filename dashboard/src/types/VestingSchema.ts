/**
 * EthVaultPQ Vesting Schedule JSON Schema
 * Version: 1.0.0
 *
 * This schema defines the standard format for vesting schedules in EthVaultPQ.
 * All vesting calculations use BLOCK NUMBERS (not timestamps) to prevent miner manipulation.
 *
 * Block Time Assumptions:
 * - Ethereum Mainnet: 12 seconds per block
 * - Test Mode (PQVault4626Demo): 12 seconds / 60 = 0.2 seconds per block (60x acceleration)
 */

export interface VestingScheduleJSON {
  /** Schema version for compatibility checking */
  version: '1.0.0';

  /** Human-readable metadata */
  metadata: {
    /** Name/title of this vesting schedule */
    name: string;
    /** Description of the vesting purpose */
    description?: string;
    /** Creation timestamp (ISO 8601) */
    createdAt: string;
    /** Creator address or identifier */
    createdBy?: string;
    /** Optional tags for categorization */
    tags?: string[];
  };

  /** Network and contract information */
  deployment: {
    /** Target network: 'tenderly', 'sepolia', 'mainnet' */
    network: 'tenderly' | 'sepolia' | 'mainnet';
    /** Vault contract address (if deploying to existing vault) */
    vaultAddress?: string;
    /** Underlying token address (e.g., USDC) */
    tokenAddress: string;
    /** Token symbol for display */
    tokenSymbol: string;
    /** Token decimals */
    tokenDecimals: number;
  };

  /** Vesting configuration */
  schedule: {
    /** Vesting mode: 'production' (real-time) or 'test' (60x acceleration) */
    mode: 'production' | 'test';

    /** Preset template used: '60-month-linear', '4-year-cliff', or 'custom' */
    preset: '60-month-linear' | '4-year-cliff' | 'custom';

    /** Total amount of tokens to vest (as string to preserve precision) */
    totalAmount: string;

    /** Start time configuration */
    startTime: {
      /** ISO 8601 timestamp of vesting start */
      timestamp: string;
      /** Block number at vesting start (calculated or actual) */
      blockNumber?: number;
      /** Is this a past-dated schedule with catch-up vesting? */
      isPastDated: boolean;
    };

    /** Cliff period (no tokens released) */
    cliff: {
      /** Duration in months */
      durationMonths: number;
      /** Duration in blocks (calculated: months * 30 * 24 * 60 * 60 / BLOCK_TIME) */
      durationBlocks: number;
      /** End time ISO 8601 */
      endTimestamp: string;
      /** End block number */
      endBlockNumber: number;
    };

    /** Linear vesting period (tokens release linearly) */
    vesting: {
      /** Total vesting duration in months (includes cliff) */
      durationMonths: number;
      /** Total vesting duration in blocks */
      durationBlocks: number;
      /** Vesting end time ISO 8601 */
      endTimestamp: string;
      /** Vesting end block number */
      endBlockNumber: number;
    };

    /** Calculated vesting rate */
    rate: {
      /** Tokens per block (as string for precision) */
      tokensPerBlock: string;
      /** Tokens per month (human-readable) */
      tokensPerMonth: string;
      /** Percentage per month */
      percentagePerMonth: number;
    };
  };

  /** Recipients of vested tokens */
  recipients: Array<{
    /** Ethereum address (wallet or vault) */
    address: string;
    /** Percentage of total allocation (must sum to 100) */
    percentage: number;
    /** Amount in tokens (calculated from percentage) */
    amount: string;
    /** Is this a vault address (for vault-to-vault vesting)? */
    isVault: boolean;
    /** Optional label for this recipient */
    label?: string;
  }>;

  /** Catch-up vesting (for past-dated schedules) */
  catchUp?: {
    /** Blocks that have passed since start */
    blocksPassed: number;
    /** Months that have passed since start */
    monthsPassed: number;
    /** Percentage already vested */
    percentageVested: number;
    /** Amount immediately claimable */
    immediatelyClaimable: string;
  };

  /** Security and verification */
  security: {
    /** Hash of all schedule parameters (for verification) */
    parametersHash?: string;
    /** Is this schedule revocable? */
    revocable: boolean;
    /** Emergency pause capability? */
    pausable: boolean;
    /** Requires post-quantum signature to modify? */
    pqProtected: boolean;
  };

  /** Audit trail */
  auditTrail?: Array<{
    /** Action timestamp ISO 8601 */
    timestamp: string;
    /** Action type */
    action: 'created' | 'deployed' | 'modified' | 'paused' | 'resumed' | 'withdrawn';
    /** Actor address */
    actor: string;
    /** Transaction hash (if on-chain) */
    txHash?: string;
    /** Additional details */
    details?: string;
  }>;
}

/**
 * Block time constants (in seconds)
 */
export const BLOCK_TIME = {
  ETHEREUM_MAINNET: 12,
  TEST_MODE_ACCELERATION: 60, // 60x faster
  get TEST_MODE() {
    return this.ETHEREUM_MAINNET / this.TEST_MODE_ACCELERATION;
  },
} as const;

/**
 * Time conversion utilities
 */
export const VestingTimeUtils = {
  /** Convert months to blocks (production mode) */
  monthsToBlocks(months: number, testMode = false): number {
    const secondsPerMonth = 30 * 24 * 60 * 60;
    const blockTime = testMode ? BLOCK_TIME.TEST_MODE : BLOCK_TIME.ETHEREUM_MAINNET;
    return Math.floor((months * secondsPerMonth) / blockTime);
  },

  /** Convert blocks to months (production mode) */
  blocksToMonths(blocks: number, testMode = false): number {
    const secondsPerMonth = 30 * 24 * 60 * 60;
    const blockTime = testMode ? BLOCK_TIME.TEST_MODE : BLOCK_TIME.ETHEREUM_MAINNET;
    return (blocks * blockTime) / secondsPerMonth;
  },

  /** Calculate block number from timestamp (estimated) */
  timestampToBlockNumber(timestamp: Date, currentBlock: number, testMode = false): number {
    const now = new Date();
    const secondsDiff = (timestamp.getTime() - now.getTime()) / 1000;
    const blockTime = testMode ? BLOCK_TIME.TEST_MODE : BLOCK_TIME.ETHEREUM_MAINNET;
    const blocksDiff = Math.floor(secondsDiff / blockTime);
    return currentBlock + blocksDiff;
  },

  /** Calculate timestamp from block number (estimated) */
  blockNumberToTimestamp(blockNumber: number, currentBlock: number, testMode = false): Date {
    const blocksDiff = blockNumber - currentBlock;
    const blockTime = testMode ? BLOCK_TIME.TEST_MODE : BLOCK_TIME.ETHEREUM_MAINNET;
    const secondsDiff = blocksDiff * blockTime;
    return new Date(Date.now() + secondsDiff * 1000);
  },
};

/**
 * Preset template definitions
 */
export const PRESET_TEMPLATES: Record<string, Partial<VestingScheduleJSON>> = {
  '60-month-linear': {
    version: '1.0.0',
    metadata: {
      name: '60-Month Linear Vesting',
      description: '5-year linear vesting with no cliff period',
      tags: ['standard', 'long-term', 'team'],
    },
    schedule: {
      preset: '60-month-linear',
      cliff: {
        durationMonths: 0,
        durationBlocks: 0,
      } as any,
      vesting: {
        durationMonths: 60,
      } as any,
    } as any,
  },

  '4-year-cliff': {
    version: '1.0.0',
    metadata: {
      name: '4-Year Vesting with 1-Year Cliff',
      description: '1-year cliff, then linear vesting over 3 years (48 months total)',
      tags: ['standard', 'cliff', 'investor'],
    },
    schedule: {
      preset: '4-year-cliff',
      cliff: {
        durationMonths: 12,
      } as any,
      vesting: {
        durationMonths: 48,
      } as any,
    } as any,
  },

  'advisor-2year': {
    version: '1.0.0',
    metadata: {
      name: 'Advisor 2-Year Vesting',
      description: '6-month cliff, then linear vesting over 18 months',
      tags: ['advisor', 'short-term'],
    },
    schedule: {
      preset: 'custom',
      cliff: {
        durationMonths: 6,
      } as any,
      vesting: {
        durationMonths: 24,
      } as any,
    } as any,
  },

  'test-5minute': {
    version: '1.0.0',
    metadata: {
      name: 'Test Mode - 5 Minute Vesting',
      description: 'Ultra-fast vesting for testing (complete in 5 minutes)',
      tags: ['test', 'demo'],
    },
    schedule: {
      mode: 'test',
      preset: 'custom',
      cliff: {
        durationMonths: 0,
      } as any,
      vesting: {
        durationMonths: 5,
      } as any,
    } as any,
  },
};

/**
 * Validation utilities
 */
export const VestingValidator = {
  /** Validate recipients sum to 100% */
  validateRecipients(recipients: VestingScheduleJSON['recipients']): boolean {
    const total = recipients.reduce((sum, r) => sum + r.percentage, 0);
    return Math.abs(total - 100) < 0.01; // Allow small floating point errors
  },

  /** Validate addresses are valid Ethereum addresses */
  validateAddresses(recipients: VestingScheduleJSON['recipients']): boolean {
    return recipients.every(r => /^0x[a-fA-F0-9]{40}$/.test(r.address));
  },

  /** Validate cliff doesn't exceed vesting duration */
  validateCliffDuration(schedule: VestingScheduleJSON['schedule']): boolean {
    return schedule.cliff.durationMonths <= schedule.vesting.durationMonths;
  },

  /** Validate schedule is not too long (max 10 years) */
  validateMaxDuration(schedule: VestingScheduleJSON['schedule']): boolean {
    return schedule.vesting.durationMonths <= 120; // 10 years
  },

  /** Validate entire schedule */
  validateSchedule(vestingSchedule: VestingScheduleJSON): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.validateRecipients(vestingSchedule.recipients)) {
      errors.push('Recipients must sum to exactly 100%');
    }

    if (!this.validateAddresses(vestingSchedule.recipients)) {
      errors.push('One or more recipient addresses are invalid');
    }

    if (!this.validateCliffDuration(vestingSchedule.schedule)) {
      errors.push('Cliff duration cannot exceed total vesting duration');
    }

    if (!this.validateMaxDuration(vestingSchedule.schedule)) {
      errors.push('Vesting duration cannot exceed 10 years (120 months)');
    }

    if (parseFloat(vestingSchedule.schedule.totalAmount) <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
