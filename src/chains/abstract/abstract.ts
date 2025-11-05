import { providers } from 'ethers';

import { Ethereum, TokenInfo } from '../ethereum/ethereum';

/**
 * Abstract Chain Wrapper
 *
 * This is a facade that exposes Abstract as a separate chain while internally
 * delegating all operations to the Ethereum chain with network='abstract'.
 *
 * This allows:
 * - Cleaner API: /chains/abstract/* instead of /chains/ethereum/* with network param
 * - Connector simplicity: Abstract.getInstance() instead of Ethereum.getInstance('abstract')
 * - Future extensibility: Can add Abstract-specific logic without affecting Ethereum
 */
export class Abstract {
  private static _instance: Abstract | null = null;
  private ethereumInstance: Ethereum | null = null;

  // Default network is always 'abstract'
  public readonly network = 'abstract';

  private constructor() {}

  /**
   * Get singleton instance of Abstract chain
   * Internally creates an Ethereum instance with network='abstract'
   */
  public static async getInstance(): Promise<Abstract> {
    if (!Abstract._instance) {
      Abstract._instance = new Abstract();
      await Abstract._instance.init();
    }
    return Abstract._instance;
  }

  /**
   * Initialize the Abstract chain by creating Ethereum instance
   */
  private async init(): Promise<void> {
    this.ethereumInstance = await Ethereum.getInstance('abstract');
  }

  /**
   * Get the underlying Ethereum instance
   * This allows full access to all Ethereum methods
   */
  public getEthereumInstance(): Ethereum {
    if (!this.ethereumInstance) {
      throw new Error('Abstract chain not initialized');
    }
    return this.ethereumInstance;
  }

  // Delegate all common properties to Ethereum instance for convenience

  public get provider(): providers.StaticJsonRpcProvider {
    return this.getEthereumInstance().provider;
  }

  public get tokenList(): TokenInfo[] {
    return this.getEthereumInstance().tokenList;
  }

  public get tokenMap(): Record<string, TokenInfo> {
    return this.getEthereumInstance().tokenMap;
  }

  public get nativeTokenSymbol(): string {
    return this.getEthereumInstance().nativeTokenSymbol;
  }

  public get chainId(): number {
    return this.getEthereumInstance().chainId;
  }

  public get rpcUrl(): string {
    return this.getEthereumInstance().rpcUrl;
  }

  public get minGasPrice(): number {
    return this.getEthereumInstance().minGasPrice;
  }

  public get chain(): string {
    return 'abstract';
  }

  // Delegate commonly used methods
  public async ready(): Promise<boolean> {
    return this.getEthereumInstance().ready();
  }

  public async getCurrentBlockNumber(): Promise<number> {
    return this.getEthereumInstance().getCurrentBlockNumber();
  }

  public async estimateGasPrice(): Promise<number> {
    return this.getEthereumInstance().estimateGasPrice();
  }
}
