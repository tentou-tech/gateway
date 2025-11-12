import { ConfigManagerV2 } from '../../services/config-manager-v2';

export interface AbstractNetworkConfig {
  chainID: number;
  nodeURL: string;
  nativeCurrencySymbol: string;
  minGasPrice?: number;
}

export interface AbstractChainConfig {
  defaultNetwork: string;
  defaultWallet: string;
  rpcProvider: string;
}

/**
 * Abstract chain always has a single network: 'abstract'
 */
export const networks = ['abstract'];

/**
 * Get Abstract chain configuration
 * Abstract chain always uses network='abstract'
 */
export function getAbstractChainConfig(): AbstractChainConfig {
  return {
    defaultNetwork: ConfigManagerV2.getInstance().get('abstract.defaultNetwork'),
    defaultWallet: ConfigManagerV2.getInstance().get('abstract.defaultWallet'),
    rpcProvider: ConfigManagerV2.getInstance().get('abstract.rpcProvider') || 'url',
  };
}

/**
 * Get Abstract network configuration
 * Since Abstract is a single-network chain, this always returns 'abstract' network config
 */
export function getAbstractNetworkConfig(): AbstractNetworkConfig {
  return {
    chainID: ConfigManagerV2.getInstance().get('abstract-abstract.chainID'),
    nodeURL: ConfigManagerV2.getInstance().get('abstract-abstract.nodeURL'),
    nativeCurrencySymbol: ConfigManagerV2.getInstance().get('abstract-abstract.nativeCurrencySymbol'),
    minGasPrice: ConfigManagerV2.getInstance().get('abstract-abstract.minGasPrice'),
  };
}
