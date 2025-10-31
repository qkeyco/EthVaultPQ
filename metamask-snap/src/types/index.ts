/**
 * Type definitions for EthVaultPQ MetaMask Snap
 */

export interface PQKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface SnapState {
  pqPublicKey?: number[];
  pqSecretKey?: number[]; // Encrypted by MetaMask
  walletAddress?: string;
  vaults?: VaultInfo[];
  initialized: boolean;
}

export interface VaultInfo {
  address: string;
  tokenAddress: string;
  tokenSymbol: string;
  totalAmount: string;
  claimedAmount: string;
  startBlock: number;
  endBlock: number;
  cliffBlock: number;
  lastClaimBlock: number;
  beneficiary: string;
}

export interface VestingSchedule {
  totalAmount: bigint;
  startBlock: number;
  endBlock: number;
  cliffBlock: number;
  vestedAmount: bigint;
  claimableAmount: bigint;
  claimedAmount: bigint;
  vestingProgress: number; // 0-100%
}

export interface TransactionData {
  to: string;
  data: string;
  value?: string;
  chainId: number;
}

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

export interface SignedTransaction {
  dilithiumSignature: Uint8Array;
  zkProof: ZKProof;
  messageHash: string;
}

export enum RPCMethod {
  // Wallet Management
  CREATE_WALLET = 'pqwallet_createWallet',
  GET_PUBLIC_KEY = 'pqwallet_getPublicKey',
  GET_WALLET_ADDRESS = 'pqwallet_getWalletAddress',
  GET_STATUS = 'pqwallet_getStatus',

  // Transaction Signing
  SIGN_TRANSACTION = 'pqwallet_signTransaction',
  SIGN_MESSAGE = 'pqwallet_signMessage',

  // Vault Management
  GET_VAULTS = 'pqwallet_getVaults',
  GET_VESTING_SCHEDULE = 'pqwallet_getVestingSchedule',
  ADD_VAULT = 'pqwallet_addVault',
  REMOVE_VAULT = 'pqwallet_removeVault',

  // Account & Balance Exposure (MetaMask Integration)
  GET_ACCOUNTS = 'pqwallet_getAccounts',
  GET_BALANCE = 'pqwallet_getBalance',
  NOTIFY_BALANCES = 'pqwallet_notifyBalances',

  // Utility
  GET_SNAP_STATE = 'pqwallet_getSnapState',
  RESET_SNAP = 'pqwallet_resetSnap',
}

export interface CreateWalletParams {
  entropySource?: 'bip44' | 'random';
}

export interface SignTransactionParams {
  transaction: TransactionData;
}

export interface GetVestingScheduleParams {
  vaultAddress: string;
  currentBlock?: number;
}

export interface AddVaultParams {
  vaultAddress: string;
  tokenAddress: string;
  tokenSymbol?: string;
}

export interface GetBalanceParams {
  address?: string; // Optional: defaults to PQWallet address
  tokenAddress?: string; // Optional: for ERC-20 balances
}

export interface NotifyBalancesParams {
  balance: string;
  tokenSymbol?: string;
}

export type RPCParams =
  | CreateWalletParams
  | SignTransactionParams
  | GetVestingScheduleParams
  | AddVaultParams
  | GetBalanceParams
  | NotifyBalancesParams
  | Record<string, never>;

export interface ContractABI {
  name: string;
  type: string;
  inputs: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  stateMutability?: string;
}

// Error types
export class SnapError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SnapError';
  }
}

export enum ErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  INVALID_PARAMS = 'INVALID_PARAMS',
  SIGNING_FAILED = 'SIGNING_FAILED',
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  VAULT_NOT_FOUND = 'VAULT_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STATE_ERROR = 'STATE_ERROR',
}
