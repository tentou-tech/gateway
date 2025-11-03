import { Static } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { getEthereumChainConfig } from '../../../chains/ethereum/ethereum.config';
import { QuoteSwapRequestType } from '../../../schemas/router-schema';
import { logger } from '../../../services/logger';
import { quoteSwap } from '../../uniswap/router-routes/quoteSwap';
import { UniswapQuoteSwapRequest, UniswapQuoteSwapResponse } from '../../uniswap/schemas';
import { UniswapAbstractConfig } from '../uniswap-abstract.config';

export const quoteSwapRoute: FastifyPluginAsync = async (fastify) => {
  const chainConfig = getEthereumChainConfig();

  fastify.get<{
    Querystring: QuoteSwapRequestType;
    Reply: Static<typeof UniswapQuoteSwapResponse>;
  }>(
    '/quote-swap',
    {
      schema: {
        description: 'Get an executable swap quote from Uniswap Universal Router on Abstract network',
        tags: ['/connector/uniswap-abstract'],
        querystring: UniswapQuoteSwapRequest,
        response: { 200: UniswapQuoteSwapResponse },
      },
    },
    async (request) => {
      try {
        const {
          network = 'abstract', // Always default to abstract
          walletAddress = chainConfig.defaultWallet,
          baseToken,
          quoteToken,
          amount,
          side,
          slippagePct = UniswapAbstractConfig.config.slippagePct,
        } = request.query as typeof UniswapQuoteSwapRequest._type;

        // Force network to be abstract
        logger.info(`[uniswap-abstract/quote-swap] Forcing network to 'abstract'`);

        return await quoteSwap(
          fastify,
          'abstract', // Force Abstract network
          walletAddress,
          baseToken,
          quoteToken,
          amount,
          side as 'BUY' | 'SELL',
          slippagePct,
        );
      } catch (e: any) {
        if (e.statusCode) throw e;
        logger.error('Error getting quote:', e);
        throw fastify.httpErrors.internalServerError(e.message || 'Internal server error');
      }
    },
  );
};

export default quoteSwapRoute;
