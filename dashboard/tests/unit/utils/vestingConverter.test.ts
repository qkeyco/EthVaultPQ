import { describe, it, expect } from 'vitest';
import {
  vestingScheduleToJSON,
  jsonToVestingSchedule,
} from '../../../src/utils/vestingConverter';
import { VestingSchedule } from '../../../src/components/VestingScheduleBuilder';
import { VestingTimeUtils, BLOCK_TIME } from '../../../src/types/VestingSchema';

describe('VestingTimeUtils', () => {
  describe('monthsToBlocks', () => {
    it('should convert months to blocks in production mode', () => {
      const blocks = VestingTimeUtils.monthsToBlocks(12, false);
      const expected = (12 * 30 * 24 * 60 * 60) / BLOCK_TIME.ETHEREUM_MAINNET;
      expect(blocks).toBe(expected);
    });

    it('should convert months to blocks in test mode (60x faster)', () => {
      const blocks = VestingTimeUtils.monthsToBlocks(12, true);
      const expected = (12 * 30 * 24 * 60 * 60) / BLOCK_TIME.TEST_MODE;
      expect(blocks).toBe(expected);
    });

    it('should handle zero months', () => {
      expect(VestingTimeUtils.monthsToBlocks(0, false)).toBe(0);
      expect(VestingTimeUtils.monthsToBlocks(0, true)).toBe(0);
    });

    it('should calculate 60-month linear blocks correctly', () => {
      const blocks = VestingTimeUtils.monthsToBlocks(60, false);
      expect(blocks).toBe(1296000); // Standard 5-year vesting
    });

    it('should calculate test mode 5-minute vesting', () => {
      const blocks = VestingTimeUtils.monthsToBlocks(5, true);
      expect(blocks).toBe(1800); // 5 months in test mode
    });
  });

  describe('blocksToMonths', () => {
    it('should convert blocks to months in production mode', () => {
      const months = VestingTimeUtils.blocksToMonths(259200, false);
      expect(months).toBeCloseTo(12, 1); // 1-year cliff
    });

    it('should convert blocks to months in test mode', () => {
      const months = VestingTimeUtils.blocksToMonths(1800, true);
      expect(months).toBeCloseTo(5, 1);
    });

    it('should be inverse of monthsToBlocks', () => {
      const originalMonths = 24;
      const blocks = VestingTimeUtils.monthsToBlocks(originalMonths, false);
      const convertedMonths = VestingTimeUtils.blocksToMonths(blocks, false);
      expect(convertedMonths).toBeCloseTo(originalMonths, 0);
    });
  });
});

describe('vestingScheduleToJSON', () => {
  it('should convert UI schedule to JSON format', () => {
    const schedule: VestingSchedule = {
      preset: '60-month-linear',
      mode: 'test',
      totalAmount: '1000000',
      startDate: new Date('2025-10-19T00:00:00.000Z'),
      cliffMonths: 0,
      vestingMonths: 60,
      recipients: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
          percentage: 100,
          isVault: false,
        },
      ],
    };

    const json = vestingScheduleToJSON(
      schedule,
      'tenderly',
      '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
      'MUSDC',
      6,
      100000
    );

    expect(json.version).toBe('1.0.0');
    expect(json.schedule.preset).toBe('60-month-linear');
    expect(json.schedule.mode).toBe('test');
    expect(json.schedule.totalAmount).toBe('1000000');
    expect(json.recipients).toHaveLength(1);
    expect(json.recipients[0].percentage).toBe(100);
  });

  it('should calculate vesting rate correctly', () => {
    const schedule: VestingSchedule = {
      preset: '4-year-cliff',
      mode: 'production',
      totalAmount: '1000000',
      startDate: new Date(),
      cliffMonths: 12,
      vestingMonths: 48,
      recipients: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
          percentage: 100,
          isVault: false,
        },
      ],
    };

    const json = vestingScheduleToJSON(
      schedule,
      'tenderly',
      '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
      'MUSDC',
      6,
      100000
    );

    expect(json.schedule.rate.tokensPerBlock).toBeTruthy();
    expect(json.schedule.rate.tokensPerMonth).toBeTruthy();
    expect(json.schedule.rate.percentagePerMonth).toBeGreaterThan(0);
  });

  it('should handle multi-recipient schedules', () => {
    const schedule: VestingSchedule = {
      preset: 'custom',
      mode: 'test',
      totalAmount: '10000000',
      startDate: new Date(),
      cliffMonths: 6,
      vestingMonths: 24,
      recipients: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
          percentage: 40,
          isVault: false,
        },
        {
          address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          percentage: 30,
          isVault: false,
        },
        {
          address: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
          percentage: 30,
          isVault: true,
        },
      ],
    };

    const json = vestingScheduleToJSON(
      schedule,
      'tenderly',
      '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
      'MUSDC',
      6,
      100000
    );

    expect(json.recipients).toHaveLength(3);
    expect(json.recipients[0].amount).toBe('4000000.00');
    expect(json.recipients[1].amount).toBe('3000000.00');
    expect(json.recipients[2].amount).toBe('3000000.00');
    expect(json.recipients[2].isVault).toBe(true);
  });
});

describe('jsonToVestingSchedule', () => {
  it('should convert JSON to UI schedule format', () => {
    const jsonSchedule = {
      version: '1.0.0' as const,
      metadata: {
        name: 'Test Schedule',
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
        preset: '60-month-linear' as const,
        totalAmount: '500000',
        startTime: {
          timestamp: new Date().toISOString(),
          isPastDated: false,
        },
        cliff: {
          durationMonths: 0,
          durationBlocks: 0,
          endTimestamp: new Date().toISOString(),
          endBlockNumber: 0,
        },
        vesting: {
          durationMonths: 60,
          durationBlocks: 108000,
          endTimestamp: new Date().toISOString(),
          endBlockNumber: 108000,
        },
        rate: {
          tokensPerBlock: '4.629629',
          tokensPerMonth: '8333.33',
          percentagePerMonth: 1.6667,
        },
      },
      recipients: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
          percentage: 100,
          amount: '500000.00',
          isVault: false,
        },
      ],
      security: {
        revocable: false,
        pausable: true,
        pqProtected: true,
      },
    };

    const schedule = jsonToVestingSchedule(jsonSchedule);

    expect(schedule.preset).toBe('60-month-linear');
    expect(schedule.mode).toBe('test');
    expect(schedule.totalAmount).toBe('500000');
    expect(schedule.cliffMonths).toBe(0);
    expect(schedule.vestingMonths).toBe(60);
    expect(schedule.recipients).toHaveLength(1);
    expect(schedule.recipients[0].percentage).toBe(100);
  });

  it('should preserve recipient data', () => {
    const jsonSchedule = {
      version: '1.0.0' as const,
      metadata: {
        name: 'Multi-recipient',
        createdAt: new Date().toISOString(),
        tags: [],
      },
      deployment: {
        network: 'tenderly' as const,
        tokenAddress: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
        tokenSymbol: 'MUSDC',
        tokenDecimals: 6,
      },
      schedule: {
        mode: 'production' as const,
        preset: 'custom' as const,
        totalAmount: '10000000',
        startTime: {
          timestamp: new Date().toISOString(),
          isPastDated: false,
        },
        cliff: {
          durationMonths: 12,
          durationBlocks: 259200,
          endTimestamp: new Date().toISOString(),
          endBlockNumber: 259200,
        },
        vesting: {
          durationMonths: 48,
          durationBlocks: 1036800,
          endTimestamp: new Date().toISOString(),
          endBlockNumber: 1036800,
        },
        rate: {
          tokensPerBlock: '12.86',
          tokensPerMonth: '277777.78',
          percentagePerMonth: 2.7778,
        },
      },
      recipients: [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
          percentage: 60,
          amount: '6000000.00',
          isVault: false,
        },
        {
          address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
          percentage: 40,
          amount: '4000000.00',
          isVault: true,
        },
      ],
      security: {
        revocable: false,
        pausable: true,
        pqProtected: true,
      },
    };

    const schedule = jsonToVestingSchedule(jsonSchedule);

    expect(schedule.recipients).toHaveLength(2);
    expect(schedule.recipients[0].percentage).toBe(60);
    expect(schedule.recipients[1].percentage).toBe(40);
    expect(schedule.recipients[1].isVault).toBe(true);
  });
});
