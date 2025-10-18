import { describe, it, expect } from 'vitest';
import { VestingValidator, BLOCK_TIME } from '../../../src/types/VestingSchema';
import type { VestingScheduleJSON } from '../../../src/types/VestingSchema';

describe('VestingValidator', () => {
  const validSchedule: VestingScheduleJSON = {
    version: '1.0.0',
    metadata: {
      name: 'Valid Schedule',
      createdAt: new Date().toISOString(),
      tags: ['test'],
    },
    deployment: {
      network: 'tenderly',
      tokenAddress: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
      tokenSymbol: 'MUSDC',
      tokenDecimals: 6,
    },
    schedule: {
      mode: 'test',
      preset: '60-month-linear',
      totalAmount: '1000000',
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
        tokensPerBlock: '9.26',
        tokensPerMonth: '16666.67',
        percentagePerMonth: 1.6667,
      },
    },
    recipients: [
      {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
        percentage: 100,
        amount: '1000000.00',
        isVault: false,
      },
    ],
    security: {
      revocable: false,
      pausable: true,
      pqProtected: true,
    },
  };

  describe('validateRecipients', () => {
    it('should validate when recipients sum to 100%', () => {
      const recipients = [
        { address: '0x123', percentage: 60, amount: '600', isVault: false },
        { address: '0x456', percentage: 40, amount: '400', isVault: false },
      ];
      expect(VestingValidator.validateRecipients(recipients)).toBe(true);
    });

    it('should invalidate when recipients dont sum to 100%', () => {
      const recipients = [
        { address: '0x123', percentage: 60, amount: '600', isVault: false },
        { address: '0x456', percentage: 30, amount: '300', isVault: false },
      ];
      expect(VestingValidator.validateRecipients(recipients)).toBe(false);
    });

    it('should allow small floating point errors', () => {
      const recipients = [
        { address: '0x123', percentage: 33.33, amount: '333.30', isVault: false },
        { address: '0x456', percentage: 33.33, amount: '333.30', isVault: false },
        { address: '0x789', percentage: 33.34, amount: '333.40', isVault: false },
      ];
      expect(VestingValidator.validateRecipients(recipients)).toBe(true);
    });
  });

  describe('validateAddresses', () => {
    it('should validate correct Ethereum addresses', () => {
      const recipients = [
        { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8', percentage: 100, amount: '1000', isVault: false },
      ];
      expect(VestingValidator.validateAddresses(recipients)).toBe(true);
    });

    it('should invalidate incorrect addresses', () => {
      const recipients = [
        { address: '0xinvalid', percentage: 100, amount: '1000', isVault: false },
      ];
      expect(VestingValidator.validateAddresses(recipients)).toBe(false);
    });

    it('should invalidate addresses with wrong length', () => {
      const recipients = [
        { address: '0x123', percentage: 100, amount: '1000', isVault: false },
      ];
      expect(VestingValidator.validateAddresses(recipients)).toBe(false);
    });
  });

  describe('validateCliffDuration', () => {
    it('should validate when cliff <= vesting duration', () => {
      const schedule = {
        ...validSchedule.schedule,
        cliff: { ...validSchedule.schedule.cliff, durationMonths: 12 },
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 48 },
      };
      expect(VestingValidator.validateCliffDuration(schedule)).toBe(true);
    });

    it('should invalidate when cliff > vesting duration', () => {
      const schedule = {
        ...validSchedule.schedule,
        cliff: { ...validSchedule.schedule.cliff, durationMonths: 48 },
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 12 },
      };
      expect(VestingValidator.validateCliffDuration(schedule)).toBe(false);
    });

    it('should validate when cliff equals vesting duration', () => {
      const schedule = {
        ...validSchedule.schedule,
        cliff: { ...validSchedule.schedule.cliff, durationMonths: 24 },
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 24 },
      };
      expect(VestingValidator.validateCliffDuration(schedule)).toBe(true);
    });
  });

  describe('validateMaxDuration', () => {
    it('should validate schedules under 10 years', () => {
      const schedule = {
        ...validSchedule.schedule,
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 60 },
      };
      expect(VestingValidator.validateMaxDuration(schedule)).toBe(true);
    });

    it('should invalidate schedules over 10 years', () => {
      const schedule = {
        ...validSchedule.schedule,
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 121 },
      };
      expect(VestingValidator.validateMaxDuration(schedule)).toBe(false);
    });

    it('should validate exactly 10 years', () => {
      const schedule = {
        ...validSchedule.schedule,
        vesting: { ...validSchedule.schedule.vesting, durationMonths: 120 },
      };
      expect(VestingValidator.validateMaxDuration(schedule)).toBe(true);
    });
  });

  describe('validateSchedule', () => {
    it('should validate a correct schedule', () => {
      const result = VestingValidator.validateSchedule(validSchedule);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch recipient percentage errors', () => {
      const invalidSchedule = {
        ...validSchedule,
        recipients: [
          { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8', percentage: 50, amount: '500000.00', isVault: false },
        ],
      };
      const result = VestingValidator.validateSchedule(invalidSchedule);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Recipients must sum to exactly 100%');
    });

    it('should catch invalid address errors', () => {
      const invalidSchedule = {
        ...validSchedule,
        recipients: [
          { address: '0xinvalid', percentage: 100, amount: '1000000.00', isVault: false },
        ],
      };
      const result = VestingValidator.validateSchedule(invalidSchedule);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One or more recipient addresses are invalid');
    });

    it('should catch multiple errors', () => {
      const invalidSchedule = {
        ...validSchedule,
        schedule: {
          ...validSchedule.schedule,
          totalAmount: '0',
          cliff: { ...validSchedule.schedule.cliff, durationMonths: 60 },
          vesting: { ...validSchedule.schedule.vesting, durationMonths: 30 },
        },
        recipients: [
          { address: '0xinvalid', percentage: 50, amount: '0', isVault: false },
        ],
      };
      const result = VestingValidator.validateSchedule(invalidSchedule);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should validate zero amount is invalid', () => {
      const invalidSchedule = {
        ...validSchedule,
        schedule: {
          ...validSchedule.schedule,
          totalAmount: '0',
        },
      };
      const result = VestingValidator.validateSchedule(invalidSchedule);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total amount must be greater than 0');
    });
  });
});

describe('BLOCK_TIME constants', () => {
  it('should have correct Ethereum mainnet block time', () => {
    expect(BLOCK_TIME.ETHEREUM_MAINNET).toBe(12);
  });

  it('should have correct test mode acceleration', () => {
    expect(BLOCK_TIME.TEST_MODE_ACCELERATION).toBe(60);
  });

  it('should calculate test mode block time correctly', () => {
    expect(BLOCK_TIME.TEST_MODE).toBe(0.2);
  });
});
