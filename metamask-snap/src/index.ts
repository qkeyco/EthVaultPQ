/**
 * EthVaultPQ MetaMask Snap
 * Post-quantum secure vesting vault management
 *
 * Features:
 * - Dilithium3 (ML-DSA-65) signature generation
 * - ZK-SNARK proof generation for on-chain verification
 * - Vesting schedule tracking and monitoring
 * - Transaction insights for vault operations
 */

import type { OnRpcRequestHandler, OnTransactionHandler } from '@metamask/snaps-sdk';
import { handleRPCRequest } from './rpc/handlers';
import { handleTransactionInsight } from './ui/transactionInsight';
import { SnapError, RPCParams } from './types';

/**
 * Handle RPC requests from dApps
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  console.log(`RPC request from ${origin}:`, request.method);

  try {
    const result = await handleRPCRequest(
      request.method,
      (request.params as RPCParams) || {}
    );

    return result;
  } catch (error) {
    console.error('RPC request failed:', error);

    if (error instanceof SnapError) {
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    return {
      error: {
        code: 'UNKNOWN_ERROR',
        message: (error as Error).message || 'Unknown error occurred',
      },
    };
  }
};

/**
 * Handle transaction insights
 * Shows vesting information when users interact with vault contracts
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  console.log('Transaction insight requested:', {
    to: transaction.to,
    chainId,
    origin: transactionOrigin,
  });

  try {
    return await handleTransactionInsight(transaction, chainId);
  } catch (error) {
    console.error('Transaction insight error:', error);
    // Don't block transactions on insight errors
    return { content: null };
  }
};

/**
 * Handle Snap installation
 */
export const onInstall = async () => {
  console.log('EthVaultPQ Snap installed');

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: {
        type: 'panel',
        children: [
          {
            type: 'heading',
            value: '🎉 Welcome to EthVaultPQ!',
          },
          {
            type: 'text',
            value:
              'Post-quantum secure vesting vault management is now available in MetaMask.',
          },
          {
            type: 'divider',
          },
          {
            type: 'text',
            value: '🔐 Features:',
          },
          {
            type: 'text',
            value: '• Dilithium3 (ML-DSA-65) signatures',
          },
          {
            type: 'text',
            value: '• ZK-SNARK proof generation',
          },
          {
            type: 'text',
            value: '• Vesting schedule tracking',
          },
          {
            type: 'text',
            value: '• Transaction insights',
          },
          {
            type: 'divider',
          },
          {
            type: 'text',
            value: '💡 Get started by creating a PQ wallet:',
          },
          {
            type: 'text',
            value: 'Call: pqwallet_createWallet',
          },
        ],
      },
    },
  });
};

/**
 * Handle Snap updates
 */
export const onUpdate = async () => {
  console.log('EthVaultPQ Snap updated');

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: {
        type: 'panel',
        children: [
          {
            type: 'heading',
            value: '✨ EthVaultPQ Updated',
          },
          {
            type: 'text',
            value: 'The Snap has been updated to the latest version.',
          },
          {
            type: 'text',
            value: 'Version: 0.1.0',
          },
        ],
      },
    },
  });
};
