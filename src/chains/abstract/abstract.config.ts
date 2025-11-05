import { ConfigManagerV2 } from '../../services/config-manager-v2';

/**
 * Abstract chain always has a single network: 'abstract'
 */
export const networks = ['abstract'];

/**
 * Get Abstract chain configuration
 * Abstract chain always uses network='abstract'
 */
export function getAbstractChainConfig() {
  return ConfigManagerV2.getInstance().get('abstract');
}

/**
 * Get Abstract network configuration
 * Since Abstract is a single-network chain, this always returns 'abstract' network config
 */
export function getAbstractNetworkConfig() {
  return ConfigManagerV2.getInstance().get('abstract-abstract');
}
