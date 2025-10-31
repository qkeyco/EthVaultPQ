/**
 * RPC Method Handlers
 * Implements all custom RPC methods exposed by the Snap
 */

import {
  RPCMethod,
  RPCParams,
  CreateWalletParams,
  SignTransactionParams,
  GetVestingScheduleParams,
  AddVaultParams,
  GetBalanceParams,
  NotifyBalancesParams,
  SnapError,
  ErrorCode,
} from '../types';
import {
  generatePQKeypair,
  storePQKeys,
  getPQKeys,
  getSnapState,
  updateSnapState,
  clearSnapState,
  deriveWalletAddress,
  isWalletInitialized,
} from '../crypto/keyManagement';
import { signAndProve, signMessage } from '../crypto/signing';
import { getVaultInfo, calculateVestingSchedule } from '../utils/vaultUtils';

/**
 * Route RPC requests to appropriate handlers
 */
export async function handleRPCRequest(
  method: string,
  params: RPCParams
): Promise<unknown> {
  switch (method) {
    case RPCMethod.CREATE_WALLET:
      return handleCreateWallet(params as CreateWalletParams);

    case RPCMethod.GET_PUBLIC_KEY:
      return handleGetPublicKey();

    case RPCMethod.GET_WALLET_ADDRESS:
      return handleGetWalletAddress();

    case RPCMethod.GET_STATUS:
      return handleGetStatus();

    case RPCMethod.SIGN_TRANSACTION:
      return handleSignTransaction(params as SignTransactionParams);

    case RPCMethod.SIGN_MESSAGE:
      return handleSignMessage(params as { message: string });

    case RPCMethod.GET_VAULTS:
      return handleGetVaults();

    case RPCMethod.GET_VESTING_SCHEDULE:
      return handleGetVestingSchedule(params as GetVestingScheduleParams);

    case RPCMethod.ADD_VAULT:
      return handleAddVault(params as AddVaultParams);

    case RPCMethod.REMOVE_VAULT:
      return handleRemoveVault(params as { vaultAddress: string });

    case RPCMethod.GET_ACCOUNTS:
      return handleGetAccounts();

    case RPCMethod.GET_BALANCE:
      return handleGetBalance(params as GetBalanceParams);

    case RPCMethod.NOTIFY_BALANCES:
      return handleNotifyBalances(params as NotifyBalancesParams);

    case RPCMethod.GET_SNAP_STATE:
      return handleGetSnapState();

    case RPCMethod.RESET_SNAP:
      return handleResetSnap();

    default:
      throw new SnapError(`Method not found: ${method}`, ErrorCode.INVALID_PARAMS);
  }
}

/**
 * Create a new PQ wallet
 */
async function handleCreateWallet(
  params: CreateWalletParams
): Promise<{ publicKey: string; address: string }> {
  console.log('handleCreateWallet called');

  // Check if already initialized
  if (await isWalletInitialized()) {
    console.log('Wallet already initialized');
    throw new SnapError(
      'Wallet already initialized. Use pqwallet_resetSnap to reset.',
      ErrorCode.ALREADY_INITIALIZED
    );
  }

  console.log('Showing confirmation dialog...');

  // Show confirmation dialog
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: {
        type: 'panel',
        children: [
          {
            type: 'heading',
            value: '🔐 Create Post-Quantum Wallet',
          },
          {
            type: 'text',
            value:
              'This will generate a new Dilithium3 (ML-DSA-65) keypair for quantum-secure signatures.',
          },
          {
            type: 'text',
            value:
              '⚠️ Make sure to backup your MetaMask seed phrase. Your PQ keys are derived from it.',
          },
        ],
      },
    },
  });

  console.log('Dialog result:', confirmed);

  if (!confirmed) {
    console.log('User rejected wallet creation');
    throw new SnapError('User rejected wallet creation', ErrorCode.INVALID_PARAMS);
  }

  console.log('Generating keypair...');
  // Generate keypair
  const keyPair = await generatePQKeypair();
  console.log('Keypair generated, public key length:', keyPair.publicKey.length);

  console.log('Storing keys...');
  // Store keys
  await storePQKeys(keyPair);
  console.log('Keys stored');

  console.log('Deriving wallet address...');
  // Derive wallet address (CREATE2 from PQWalletFactory)
  const address = await deriveWalletAddress(keyPair.publicKey);
  console.log('Address derived:', address);

  await updateSnapState({ walletAddress: address });
  console.log('State updated');

  const result = {
    publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    address,
  };

  console.log('Returning result:', { address: result.address, pubKeyLength: result.publicKey.length });

  return result;
}

/**
 * Get public key
 */
async function handleGetPublicKey(): Promise<string> {
  const { publicKey } = await getPQKeys();
  return Buffer.from(publicKey).toString('hex');
}

/**
 * Get wallet address
 */
async function handleGetWalletAddress(): Promise<string> {
  const state = await getSnapState();
  if (!state.walletAddress) {
    throw new SnapError('Wallet not initialized', ErrorCode.NOT_INITIALIZED);
  }
  return state.walletAddress;
}

/**
 * Get Snap status (non-throwing, for UI control flow)
 */
async function handleGetStatus(): Promise<{ installed: boolean; hasWallet: boolean; address?: string; publicKey?: string }> {
  const initialized = await isWalletInitialized();
  const state = await getSnapState();

  let publicKey: string | undefined;
  if (initialized && state.pqPublicKey) {
    publicKey = Buffer.from(state.pqPublicKey).toString('hex');
  }

  return {
    installed: true, // If this method is called, Snap is installed
    hasWallet: initialized,
    address: state.walletAddress,
    publicKey,
  };
}

/**
 * Sign a transaction and generate ZK proof
 */
async function handleSignTransaction(params: SignTransactionParams) {
  if (!params.transaction) {
    throw new SnapError('Missing transaction data', ErrorCode.INVALID_PARAMS);
  }

  // Show transaction confirmation dialog
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: {
        type: 'panel',
        children: [
          {
            type: 'heading',
            value: '✍️ Sign Transaction',
          },
          {
            type: 'text',
            value: `To: ${params.transaction.to}`,
          },
          {
            type: 'text',
            value: `Value: ${params.transaction.value || '0'} ETH`,
          },
          {
            type: 'text',
            value: `Chain ID: ${params.transaction.chainId}`,
          },
          {
            type: 'divider',
          },
          {
            type: 'text',
            value:
              '🔐 This will sign the transaction with Dilithium3 and generate a ZK-SNARK proof.',
          },
        ],
      },
    },
  });

  if (!confirmed) {
    throw new SnapError('User rejected transaction', ErrorCode.INVALID_PARAMS);
  }

  // Sign and generate proof
  const result = await signAndProve(params.transaction);

  return {
    signature: Buffer.from(result.dilithiumSignature).toString('hex'),
    zkProof: result.zkProof,
    messageHash: result.messageHash,
  };
}

/**
 * Sign a message
 */
async function handleSignMessage(params: { message: string }): Promise<string> {
  if (!params.message) {
    throw new SnapError('Missing message', ErrorCode.INVALID_PARAMS);
  }

  const signature = await signMessage(params.message);
  return Buffer.from(signature).toString('hex');
}

/**
 * Get all tracked vaults
 */
async function handleGetVaults() {
  const state = await getSnapState();
  return state.vaults || [];
}

/**
 * Get vesting schedule for a vault
 */
async function handleGetVestingSchedule(params: GetVestingScheduleParams) {
  if (!params.vaultAddress) {
    throw new SnapError('Missing vaultAddress', ErrorCode.INVALID_PARAMS);
  }

  try {
    // Fetch vault info from chain
    const vaultInfo = await getVaultInfo(params.vaultAddress);

    // Calculate vesting schedule
    const schedule = await calculateVestingSchedule(
      vaultInfo,
      params.currentBlock
    );

    return schedule;
  } catch (error) {
    console.error('Failed to get vesting schedule:', error);
    throw new SnapError(
      'Failed to fetch vesting schedule',
      ErrorCode.NETWORK_ERROR
    );
  }
}

/**
 * Add a vault to track
 */
async function handleAddVault(params: AddVaultParams) {
  if (!params.vaultAddress || !params.tokenAddress) {
    throw new SnapError(
      'Missing vaultAddress or tokenAddress',
      ErrorCode.INVALID_PARAMS
    );
  }

  const state = await getSnapState();
  const vaults = state.vaults || [];

  // Check if vault already exists
  if (vaults.some((v) => v.address === params.vaultAddress)) {
    throw new SnapError('Vault already tracked', ErrorCode.INVALID_PARAMS);
  }

  // Fetch vault info
  const vaultInfo = await getVaultInfo(params.vaultAddress);

  // Add to tracked vaults
  vaults.push({
    ...vaultInfo,
    tokenAddress: params.tokenAddress,
    tokenSymbol: params.tokenSymbol || 'TOKEN',
  });

  await updateSnapState({ vaults });

  return vaultInfo;
}

/**
 * Remove a tracked vault
 */
async function handleRemoveVault(params: { vaultAddress: string }) {
  if (!params.vaultAddress) {
    throw new SnapError('Missing vaultAddress', ErrorCode.INVALID_PARAMS);
  }

  const state = await getSnapState();
  const vaults = state.vaults || [];

  const filteredVaults = vaults.filter((v) => v.address !== params.vaultAddress);

  if (filteredVaults.length === vaults.length) {
    throw new SnapError('Vault not found', ErrorCode.VAULT_NOT_FOUND);
  }

  await updateSnapState({ vaults: filteredVaults });

  return { success: true };
}

/**
 * Get current Snap state (debug)
 */
async function handleGetSnapState() {
  const state = await getSnapState();
  // Don't expose secret key
  return {
    ...state,
    pqSecretKey: state.pqSecretKey ? '***REDACTED***' : undefined,
  };
}

/**
 * Reset Snap (clear all data)
 */
async function handleResetSnap() {
  const confirmed = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: {
        type: 'panel',
        children: [
          {
            type: 'heading',
            value: '⚠️ Reset Snap',
          },
          {
            type: 'text',
            value:
              'This will delete all stored data including your PQ keys and tracked vaults.',
          },
          {
            type: 'text',
            value: '🔴 This action cannot be undone!',
          },
        ],
      },
    },
  });

  if (!confirmed) {
    throw new SnapError('User cancelled reset', ErrorCode.INVALID_PARAMS);
  }

  await clearSnapState();

  return { success: true, message: 'Snap reset successfully' };
}

/**
 * Get accounts managed by this Snap
 * Exposes the PQWallet address to MetaMask account list
 */
async function handleGetAccounts() {
  const state = await getSnapState();

  if (!state.walletAddress) {
    // No wallet created yet, return empty array
    return [];
  }

  return [
    {
      address: state.walletAddress,
      type: 'pqwallet', // Custom type label
      label: 'PQ Vault Account (Read-Only)',
      balance: '0', // Will be populated by getBalance
    },
  ];
}

/**
 * Get balance for PQWallet or vault address
 * Supports both native ETH and ERC-20 tokens
 */
async function handleGetBalance(params: GetBalanceParams) {
  const state = await getSnapState();
  const address = params.address || state.walletAddress;

  if (!address) {
    throw new SnapError('No address available', ErrorCode.NOT_INITIALIZED);
  }

  try {
    if (params.tokenAddress) {
      // ERC-20 token balance
      const balance = await fetchERC20Balance(address, params.tokenAddress);
      return { address, balance, tokenAddress: params.tokenAddress };
    } else {
      // Native ETH balance
      const balance = await fetchETHBalance(address);
      return { address, balance };
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw new SnapError(
      'Failed to fetch balance',
      ErrorCode.NETWORK_ERROR
    );
  }
}

/**
 * Send balance notification to user
 * Shows updated balances in MetaMask UI
 */
async function handleNotifyBalances(params: NotifyBalancesParams) {
  if (!params.balance) {
    throw new SnapError('Missing balance parameter', ErrorCode.INVALID_PARAMS);
  }

  const symbol = params.tokenSymbol || 'ETH';
  const formattedBalance = formatBalance(params.balance, symbol);

  await snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message: `Vault balance: ${formattedBalance}`,
    },
  });

  return { success: true };
}

/**
 * Fetch ETH balance from RPC
 */
async function fetchETHBalance(address: string): Promise<string> {
  // Use Tenderly RPC endpoint
  const rpcUrl = 'https://virtual.mainnet.us-west.rpc.tenderly.co/8d34857c-35dd-4e13-b36d-2688a4377b1f';

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  return data.result || '0x0';
}

/**
 * Fetch ERC-20 token balance
 */
async function fetchERC20Balance(address: string, tokenAddress: string): Promise<string> {
  // balanceOf(address) function signature
  const balanceOfSig = '0x70a08231';
  const paddedAddress = address.slice(2).padStart(64, '0');
  const callData = balanceOfSig + paddedAddress;

  const rpcUrl = 'https://virtual.mainnet.us-west.rpc.tenderly.co/8d34857c-35dd-4e13-b36d-2688a4377b1f';

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: callData,
        },
        'latest',
      ],
      id: 1,
    }),
  });

  const data = await response.json();
  return data.result || '0x0';
}

/**
 * Format balance for display
 */
function formatBalance(balanceHex: string, symbol: string): string {
  try {
    const balance = BigInt(balanceHex);
    const decimals = symbol === 'ETH' ? 18 : 6; // Assume USDC-like for tokens
    const divisor = BigInt(10 ** decimals);
    const whole = balance / divisor;
    const fraction = balance % divisor;

    return `${whole}.${fraction.toString().padStart(decimals, '0').slice(0, 4)} ${symbol}`;
  } catch {
    return `0 ${symbol}`;
  }
}
