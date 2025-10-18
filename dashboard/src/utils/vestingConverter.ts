import type { VestingSchedule, VestingRecipient } from '../components/VestingScheduleBuilder';
import type { VestingScheduleJSON } from '../types/VestingSchema';
import { VestingTimeUtils, BLOCK_TIME, VestingValidator } from '../types/VestingSchema';

/**
 * Convert UI VestingSchedule to JSON format
 */
export function vestingScheduleToJSON(
  schedule: VestingSchedule,
  network: 'tenderly' | 'sepolia' | 'mainnet',
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  currentBlockNumber: number,
  vaultAddress?: string
): VestingScheduleJSON {
  const isTestMode = schedule.mode === 'test';
  const startDate = schedule.startDate;
  const now = new Date();

  // Calculate block numbers
  const startBlock = VestingTimeUtils.timestampToBlockNumber(startDate, currentBlockNumber, isTestMode);
  const cliffBlocks = VestingTimeUtils.monthsToBlocks(schedule.cliffMonths, isTestMode);
  const vestingBlocks = VestingTimeUtils.monthsToBlocks(schedule.vestingMonths, isTestMode);

  const cliffEndBlock = startBlock + cliffBlocks;
  const vestingEndBlock = startBlock + vestingBlocks;

  // Calculate timestamps
  const cliffEndTimestamp = VestingTimeUtils.blockNumberToTimestamp(cliffEndBlock, currentBlockNumber, isTestMode);
  const vestingEndTimestamp = VestingTimeUtils.blockNumberToTimestamp(vestingEndBlock, currentBlockNumber, isTestMode);

  // Calculate vesting rate
  const totalAmount = parseFloat(schedule.totalAmount);
  const activeVestingBlocks = vestingBlocks - cliffBlocks;
  const tokensPerBlock = activeVestingBlocks > 0 ? totalAmount / activeVestingBlocks : 0;
  const blocksPerMonth = VestingTimeUtils.monthsToBlocks(1, isTestMode);
  const tokensPerMonth = tokensPerBlock * blocksPerMonth;
  const percentagePerMonth = (tokensPerMonth / totalAmount) * 100;

  // Calculate catch-up if past-dated
  const isPastDated = startDate < now;
  let catchUp: VestingScheduleJSON['catchUp'] | undefined;

  if (isPastDated) {
    const timePassed = (now.getTime() - startDate.getTime()) / 1000;
    const blockTime = isTestMode ? BLOCK_TIME.TEST_MODE : BLOCK_TIME.ETHEREUM_MAINNET;
    const blocksPassed = Math.floor(timePassed / blockTime);
    const monthsPassed = VestingTimeUtils.blocksToMonths(blocksPassed, isTestMode);

    let percentageVested = 0;
    let immediatelyClaimable = 0;

    if (blocksPassed >= cliffBlocks) {
      const vestingBlocksPassed = Math.min(blocksPassed - cliffBlocks, activeVestingBlocks);
      percentageVested = (vestingBlocksPassed / activeVestingBlocks) * 100;
      immediatelyClaimable = (percentageVested / 100) * totalAmount;
    }

    catchUp = {
      blocksPassed,
      monthsPassed: Math.floor(monthsPassed),
      percentageVested: Math.round(percentageVested),
      immediatelyClaimable: immediatelyClaimable.toFixed(2),
    };
  }

  // Build recipients with calculated amounts
  const recipients = schedule.recipients.map(r => ({
    address: r.address,
    percentage: r.percentage,
    amount: ((r.percentage / 100) * totalAmount).toFixed(2),
    isVault: r.isVault,
  }));

  const vestingJSON: VestingScheduleJSON = {
    version: '1.0.0',
    metadata: {
      name: `${schedule.preset} Vesting Schedule`,
      description: `${schedule.mode === 'test' ? 'Test mode (60x accelerated)' : 'Production'} vesting schedule`,
      createdAt: new Date().toISOString(),
      tags: [schedule.preset, schedule.mode],
    },
    deployment: {
      network,
      vaultAddress,
      tokenAddress,
      tokenSymbol,
      tokenDecimals,
    },
    schedule: {
      mode: schedule.mode,
      preset: schedule.preset,
      totalAmount: schedule.totalAmount,
      startTime: {
        timestamp: startDate.toISOString(),
        blockNumber: startBlock,
        isPastDated,
      },
      cliff: {
        durationMonths: schedule.cliffMonths,
        durationBlocks: cliffBlocks,
        endTimestamp: cliffEndTimestamp.toISOString(),
        endBlockNumber: cliffEndBlock,
      },
      vesting: {
        durationMonths: schedule.vestingMonths,
        durationBlocks: vestingBlocks,
        endTimestamp: vestingEndTimestamp.toISOString(),
        endBlockNumber: vestingEndBlock,
      },
      rate: {
        tokensPerBlock: tokensPerBlock.toFixed(6),
        tokensPerMonth: tokensPerMonth.toFixed(2),
        percentagePerMonth: parseFloat(percentagePerMonth.toFixed(4)),
      },
    },
    recipients,
    catchUp,
    security: {
      revocable: false,
      pausable: true,
      pqProtected: true,
    },
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'created',
        actor: 'UI',
        details: 'Schedule created via VestingScheduleBuilder',
      },
    ],
  };

  return vestingJSON;
}

/**
 * Convert JSON format to UI VestingSchedule
 */
export function jsonToVestingSchedule(json: VestingScheduleJSON): VestingSchedule {
  return {
    preset: json.schedule.preset,
    mode: json.schedule.mode,
    totalAmount: json.schedule.totalAmount,
    startDate: new Date(json.schedule.startTime.timestamp),
    cliffMonths: json.schedule.cliff.durationMonths,
    vestingMonths: json.schedule.vesting.durationMonths,
    recipients: json.recipients.map(r => ({
      address: r.address,
      percentage: r.percentage,
      isVault: r.isVault,
    })),
  };
}

/**
 * Export schedule to downloadable JSON file
 */
export function exportScheduleToFile(schedule: VestingScheduleJSON, filename?: string) {
  const json = JSON.stringify(schedule, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `vesting-schedule-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import schedule from JSON file
 */
export function importScheduleFromFile(): Promise<VestingScheduleJSON> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);

          // Validate the imported schedule
          const validation = VestingValidator.validateSchedule(json);
          if (!validation.valid) {
            reject(new Error(`Invalid schedule: ${validation.errors.join(', ')}`));
            return;
          }

          resolve(json);
        } catch (error) {
          reject(new Error('Failed to parse JSON file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * Copy schedule JSON to clipboard
 */
export async function copyScheduleToClipboard(schedule: VestingScheduleJSON): Promise<void> {
  const json = JSON.stringify(schedule, null, 2);
  await navigator.clipboard.writeText(json);
}

/**
 * Parse schedule from clipboard
 */
export async function pasteScheduleFromClipboard(): Promise<VestingScheduleJSON> {
  const text = await navigator.clipboard.readText();
  const json = JSON.parse(text);

  const validation = VestingValidator.validateSchedule(json);
  if (!validation.valid) {
    throw new Error(`Invalid schedule: ${validation.errors.join(', ')}`);
  }

  return json;
}
