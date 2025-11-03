import { AvailableNetworks } from '../../services/base';
import { ConfigManagerV2 } from '../../services/config-manager-v2';

export namespace UniswapAbstractConfig {
  // Uniswap Abstract connector - locked to Abstract network only
  export const chain = 'ethereum';
  export const networks = ['abstract']; // Fixed to Abstract network
  export type Network = 'abstract';

  // Supported trading types - router only
  export const tradingTypes = ['router'] as const;

  export interface RootConfig {
    // Global configuration
    slippagePct: number;
    maximumHops: number;

    // Available networks - only Abstract
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: RootConfig = {
    slippagePct:
      ConfigManagerV2.getInstance().get('uniswap-abstract.slippagePct') ||
      ConfigManagerV2.getInstance().get('uniswap.slippagePct') ||
      2,
    maximumHops:
      ConfigManagerV2.getInstance().get('uniswap-abstract.maximumHops') ||
      ConfigManagerV2.getInstance().get('uniswap.maximumHops') ||
      4,

    availableNetworks: [
      {
        chain,
        networks: networks,
      },
    ],
  };
}
