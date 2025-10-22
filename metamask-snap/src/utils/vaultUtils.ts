/**
 * Vault Utilities
 * Helper functions for interacting with PQVault contracts
 */

import { ethers } from 'ethers';
import { VaultInfo, VestingSchedule, SnapError, ErrorCode } from '../types';

// Simplified PQVault4626 ABI (only the methods we need)
const VAULT_ABI = [
  'function beneficiary() view returns (address)',
  'function totalAmount() view returns (uint256)',
  'function claimedAmount() view returns (uint256)',
  'function startBlock() view returns (uint256)',
  'function endBlock() view returns (uint256)',
  'function cliffBlock() view returns (uint256)',
  'function lastClaimBlock() view returns (uint256)',
  'function asset() view returns (address)',
  'function calculateVestedAmount(uint256 currentBlock) view returns (uint256)',
  'function calculateClaimableAmount(uint256 currentBlock) view returns (uint256)',
];

/**
 * Get RPC provider for current network
 */
async function getProvider(): Promise<ethers.JsonRpcProvider> {
  // Get current network from MetaMask
  // For now, use Tenderly RPC
  const rpcUrl =
    'https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Fetch vault information from blockchain
 */
export async function getVaultInfo(vaultAddress: string): Promise<VaultInfo> {
  try {
    const provider = await getProvider();
    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

    // Fetch vault data
    const [
      beneficiary,
      totalAmount,
      claimedAmount,
      startBlock,
      endBlock,
      cliffBlock,
      lastClaimBlock,
      tokenAddress,
    ] = await Promise.all([
      vault.beneficiary(),
      vault.totalAmount(),
      vault.claimedAmount(),
      vault.startBlock(),
      vault.endBlock(),
      vault.cliffBlock(),
      vault.lastClaimBlock(),
      vault.asset(),
    ]);

    return {
      address: vaultAddress,
      tokenAddress,
      tokenSymbol: 'TOKEN', // TODO: Fetch from token contract
      totalAmount: totalAmount.toString(),
      claimedAmount: claimedAmount.toString(),
      startBlock: Number(startBlock),
      endBlock: Number(endBlock),
      cliffBlock: Number(cliffBlock),
      lastClaimBlock: Number(lastClaimBlock),
      beneficiary,
    };
  } catch (error) {
    console.error('Failed to fetch vault info:', error);
    throw new SnapError(
      `Failed to fetch vault information: ${(error as Error).message}`,
      ErrorCode.NETWORK_ERROR
    );
  }
}

/**
 * Calculate vesting schedule and current status
 */
export async function calculateVestingSchedule(
  vaultInfo: VaultInfo,
  currentBlock?: number
): Promise<VestingSchedule> {
  try {
    const provider = await getProvider();
    const vault = new ethers.Contract(vaultInfo.address, VAULT_ABI, provider);

    // Get current block if not provided
    if (!currentBlock) {
      currentBlock = await provider.getBlockNumber();
    }

    // Calculate vested and claimable amounts
    const [vestedAmount, claimableAmount] = await Promise.all([
      vault.calculateVestedAmount(currentBlock),
      vault.calculateClaimableAmount(currentBlock),
    ]);

    // Calculate vesting progress percentage
    const totalBlocks = vaultInfo.endBlock - vaultInfo.startBlock;
    const elapsedBlocks = Math.max(0, currentBlock - vaultInfo.startBlock);
    const vestingProgress = Math.min(100, (elapsedBlocks / totalBlocks) * 100);

    return {
      totalAmount: BigInt(vaultInfo.totalAmount),
      startBlock: vaultInfo.startBlock,
      endBlock: vaultInfo.endBlock,
      cliffBlock: vaultInfo.cliffBlock,
      vestedAmount: BigInt(vestedAmount.toString()),
      claimableAmount: BigInt(claimableAmount.toString()),
      claimedAmount: BigInt(vaultInfo.claimedAmount),
      vestingProgress,
    };
  } catch (error) {
    console.error('Failed to calculate vesting schedule:', error);
    throw new SnapError(
      'Failed to calculate vesting schedule',
      ErrorCode.NETWORK_ERROR
    );
  }
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number = 18
): string {
  const amountBN = typeof amount === 'string' ? BigInt(amount) : amount;
  const formatted = ethers.formatUnits(amountBN, decimals);
  return parseFloat(formatted).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/**
 * Calculate estimated unlock date (assuming 12s block time)
 */
export function estimateUnlockDate(
  currentBlock: number,
  targetBlock: number,
  blockTime: number = 12
): Date {
  const blocksRemaining = Math.max(0, targetBlock - currentBlock);
  const secondsRemaining = blocksRemaining * blockTime;
  const unlockDate = new Date(Date.now() + secondsRemaining * 1000);
  return unlockDate;
}

/**
 * Format time remaining until unlock
 */
export function formatTimeRemaining(unlockDate: Date): string {
  const now = new Date();
  const msRemaining = unlockDate.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return 'Unlocked';
  }

  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if vault transaction is safe (enough unlocked tokens)
 */
export function isVaultWithdrawalSafe(
  withdrawAmount: bigint,
  claimableAmount: bigint
): boolean {
  return withdrawAmount <= claimableAmount;
}

/**
 * Decode vault transaction data
 */
export function decodeVaultTransaction(txData: string): {
  method: string;
  params: any;
} | null {
  try {
    const iface = new ethers.Interface(VAULT_ABI);
    const decoded = iface.parseTransaction({ data: txData });

    if (!decoded) {
      return null;
    }

    return {
      method: decoded.name,
      params: decoded.args,
    };
  } catch (error) {
    console.error('Failed to decode vault transaction:', error);
    return null;
  }
}
