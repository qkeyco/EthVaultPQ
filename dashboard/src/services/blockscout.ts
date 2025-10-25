/**
 * Blockscout API Service
 *
 * Integrates with Blockscout REST API v2 for blockchain data
 * Prize Eligibility: Blockscout Integration
 */

import { NETWORK } from '../config/networks';

export interface BlockscoutTransaction {
  hash: string;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  };
  value: string;
  fee: {
    value: string;
  };
  gas_limit: string;
  gas_used: string;
  gas_price: string;
  timestamp: string;
  status: 'ok' | 'error';
  method: string | null;
  result: string;
  confirmations: number;
  type: number;
  block_number: number;
}

export interface BlockscoutTokenBalance {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    type: string;
  };
  value: string;
  token_id: string | null;
}

export interface BlockscoutContractInfo {
  verified: boolean;
  name: string | null;
  compiler_version: string | null;
  optimization_enabled: boolean | null;
  optimization_runs: number | null;
  evm_version: string | null;
  verified_at: string | null;
  is_verified_via_sourcify: boolean;
  is_partially_verified: boolean;
  is_fully_verified: boolean;
  source_code: string | null;
  abi: any[] | null;
  constructor_args: string | null;
}

export interface BlockscoutAddressInfo {
  hash: string;
  name: string | null;
  is_contract: boolean;
  is_verified: boolean;
  balance: string;
  exchange_rate: string | null;
  transaction_count: number;
  token_balances_count: number;
}

/**
 * Blockscout API Client
 */
class BlockscoutAPI {
  private baseUrl: string;

  constructor() {
    // Use blockscoutUrl from network config
    this.baseUrl = (NETWORK as any).blockscoutUrl || 'https://eth-sepolia.blockscout.com';
  }

  /**
   * Get base API URL
   */
  private getApiUrl(): string {
    // Blockscout API v2 endpoint pattern
    return `${this.baseUrl}/api/v2`;
  }

  /**
   * Fetch from Blockscout API with error handling
   */
  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.getApiUrl()}${endpoint}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Blockscout API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Blockscout API fetch error:', error);
      throw error;
    }
  }

  /**
   * Get address information
   */
  async getAddressInfo(address: string): Promise<BlockscoutAddressInfo> {
    return this.fetch<BlockscoutAddressInfo>(`/addresses/${address}`);
  }

  /**
   * Get transaction history for an address
   */
  async getAddressTransactions(
    address: string,
    options?: {
      filter?: 'to' | 'from';
      limit?: number;
    }
  ): Promise<{ items: BlockscoutTransaction[]; next_page_params: any }> {
    let endpoint = `/addresses/${address}/transactions`;

    const params = new URLSearchParams();
    if (options?.filter) {
      params.append('filter', options.filter);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.fetch(endpoint);
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(address: string): Promise<{ items: BlockscoutTokenBalance[] }> {
    return this.fetch(`/addresses/${address}/tokens`);
  }

  /**
   * Get contract verification info
   */
  async getContractInfo(address: string): Promise<BlockscoutContractInfo> {
    return this.fetch<BlockscoutContractInfo>(`/smart-contracts/${address}`);
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<BlockscoutTransaction> {
    return this.fetch<BlockscoutTransaction>(`/transactions/${txHash}`);
  }

  /**
   * Check if contract is verified
   */
  async isContractVerified(address: string): Promise<boolean> {
    try {
      const info = await this.getContractInfo(address);
      return info.is_fully_verified || info.verified;
    } catch (error) {
      // If contract info not found, it's not verified
      return false;
    }
  }

  /**
   * Get recent transactions with pagination support
   */
  async getRecentTransactions(
    address: string,
    limit: number = 10
  ): Promise<BlockscoutTransaction[]> {
    try {
      const response = await this.getAddressTransactions(address);
      return response.items.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  /**
   * Get ETH balance in human-readable format
   */
  async getEthBalance(address: string): Promise<string> {
    try {
      const info = await this.getAddressInfo(address);
      // Balance is in wei (string), convert to ETH
      const weiBalance = BigInt(info.balance);
      const ethBalance = Number(weiBalance) / 1e18;
      return ethBalance.toFixed(6);
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return '0';
    }
  }
}

// Export singleton instance
export const blockscoutAPI = new BlockscoutAPI();

/**
 * Utility functions
 */

/**
 * Format transaction value from wei to ETH
 */
export function formatTransactionValue(weiValue: string): string {
  const wei = BigInt(weiValue);
  const eth = Number(wei) / 1e18;

  if (eth === 0) return '0 ETH';
  if (eth < 0.000001) return '< 0.000001 ETH';

  return `${eth.toFixed(6)} ETH`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Get transaction status badge color
 */
export function getStatusColor(status: 'ok' | 'error'): string {
  return status === 'ok' ? 'green' : 'red';
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 6): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
