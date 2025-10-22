/**
 * Transaction Insight UI
 * Displays vesting information when users interact with vault contracts
 */

import { panel, heading, text, divider } from '@metamask/snaps-sdk';
import { decodeVaultTransaction, formatTokenAmount, formatTimeRemaining, estimateUnlockDate, isVaultWithdrawalSafe } from '../utils/vaultUtils';
import { getSnapState } from '../crypto/keyManagement';
import { calculateVestingSchedule } from '../utils/vaultUtils';

/**
 * Handle transaction insight requests
 */
export async function handleTransactionInsight(
  transaction: any,
  chainId: string
): Promise<any> {
  try {
    // Check if this is a vault transaction
    const decoded = decodeVaultTransaction(transaction.data);

    if (!decoded) {
      // Not a vault transaction, no insight needed
      return { content: null };
    }

    // Get state to find tracked vaults
    const state = await getSnapState();
    const vaults = state.vaults || [];

    // Check if this vault is tracked
    const vault = vaults.find((v) => v.address === transaction.to);

    if (!vault) {
      // Vault not tracked, show minimal info
      return {
        content: panel([
          heading('🏦 EthVaultPQ Vault'),
          text('This appears to be a vault transaction.'),
          text(`Vault: ${transaction.to}`),
          divider(),
          text('💡 Add this vault to track vesting schedules.'),
        ]),
      };
    }

    // Handle different transaction types
    switch (decoded.method) {
      case 'withdraw':
      case 'redeem':
        return await showWithdrawInsight(vault, decoded.params, transaction);

      case 'claim':
        return await showClaimInsight(vault, transaction);

      case 'deposit':
      case 'mint':
        return await showDepositInsight(vault, decoded.params);

      default:
        return await showGenericVaultInsight(vault, decoded.method);
    }
  } catch (error) {
    console.error('Transaction insight error:', error);
    // Don't block transaction on insight errors
    return { content: null };
  }
}

/**
 * Show insight for withdraw/redeem transactions
 */
async function showWithdrawInsight(
  vault: any,
  params: any,
  transaction: any
): Promise<any> {
  try {
    // Get current vesting schedule
    const schedule = await calculateVestingSchedule(vault);

    const withdrawAmount = BigInt(params[0]?.toString() || '0');
    const isSafe = isVaultWithdrawalSafe(withdrawAmount, schedule.claimableAmount);

    const unlockDate = estimateUnlockDate(
      0, // current block (will be fetched in estimateUnlockDate)
      vault.endBlock
    );

    return {
      content: panel([
        heading('💰 Vault Withdrawal'),
        text(`Vault: ${vault.address.slice(0, 10)}...${vault.address.slice(-8)}`),
        text(`Token: ${vault.tokenSymbol}`),
        divider(),
        text(`Requesting: ${formatTokenAmount(withdrawAmount)} ${vault.tokenSymbol}`),
        text(`Available: ${formatTokenAmount(schedule.claimableAmount)} ${vault.tokenSymbol}`),
        text(`Already claimed: ${formatTokenAmount(schedule.claimedAmount)} ${vault.tokenSymbol}`),
        divider(),
        text(`Vesting Progress: ${schedule.vestingProgress.toFixed(1)}%`),
        text(`Time remaining: ${formatTimeRemaining(unlockDate)}`),
        divider(),
        text(
          isSafe
            ? '✅ Sufficient unlocked balance'
            : '⚠️ WARNING: Not enough unlocked tokens! Transaction will fail.'
        ),
      ]),
    };
  } catch (error) {
    console.error('Withdraw insight error:', error);
    return {
      content: panel([
        heading('💰 Vault Withdrawal'),
        text('⚠️ Could not fetch vesting details'),
      ]),
    };
  }
}

/**
 * Show insight for claim transactions
 */
async function showClaimInsight(vault: any, transaction: any): Promise<any> {
  try {
    const schedule = await calculateVestingSchedule(vault);

    return {
      content: panel([
        heading('📥 Claim Vested Tokens'),
        text(`Vault: ${vault.address.slice(0, 10)}...${vault.address.slice(-8)}`),
        divider(),
        text(`Claimable: ${formatTokenAmount(schedule.claimableAmount)} ${vault.tokenSymbol}`),
        text(`Total vested: ${formatTokenAmount(schedule.vestedAmount)} ${vault.tokenSymbol}`),
        text(`Already claimed: ${formatTokenAmount(schedule.claimedAmount)} ${vault.tokenSymbol}`),
        divider(),
        text(`Vesting: ${schedule.vestingProgress.toFixed(1)}% complete`),
        text(
          schedule.claimableAmount > 0n
            ? '✅ Tokens ready to claim'
            : '⏳ No tokens available yet'
        ),
      ]),
    };
  } catch (error) {
    console.error('Claim insight error:', error);
    return {
      content: panel([
        heading('📥 Claim Vested Tokens'),
        text('⚠️ Could not fetch vesting details'),
      ]),
    };
  }
}

/**
 * Show insight for deposit/mint transactions
 */
async function showDepositInsight(vault: any, params: any): Promise<any> {
  const depositAmount = BigInt(params[0]?.toString() || '0');

  return {
    content: panel([
      heading('📤 Deposit to Vault'),
      text(`Vault: ${vault.address.slice(0, 10)}...${vault.address.slice(-8)}`),
      divider(),
      text(`Depositing: ${formatTokenAmount(depositAmount)} ${vault.tokenSymbol}`),
      text(''),
      text('💡 Deposited tokens will follow the vesting schedule.'),
    ]),
  };
}

/**
 * Show generic vault insight
 */
async function showGenericVaultInsight(vault: any, method: string): Promise<any> {
  return {
    content: panel([
      heading('🏦 Vault Transaction'),
      text(`Vault: ${vault.address.slice(0, 10)}...${vault.address.slice(-8)}`),
      text(`Method: ${method}`),
      divider(),
      text(`Token: ${vault.tokenSymbol}`),
      text(''),
      text('💡 This vault uses post-quantum cryptography (Dilithium3).'),
    ]),
  };
}
