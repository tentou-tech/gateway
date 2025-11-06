import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { getAbstractChainConfig } from '../../../chains/abstract/abstract.config';
import { ExecuteQuoteRequestType, SwapExecuteResponseType, SwapExecuteResponse } from '../../../schemas/router-schema';
import { logger } from '../../../services/logger';
import { executeQuote } from '../../uniswap/router-routes/executeQuote';
import { UniswapExecuteQuoteRequest } from '../../uniswap/schemas';

// Import the executeQuote function from regular uniswap

export { executeQuote };

export const executeQuoteRoute: FastifyPluginAsync = async (fastify) => {
  const chainConfig = getAbstractChainConfig();

  fastify.post<{
    Body: ExecuteQuoteRequestType;
    Reply: SwapExecuteResponseType;
  }>(
    '/execute-quote',
    {
      schema: {
        description: 'Execute a previously generated swap quote on Abstract network',
        tags: ['/connector/uniswap-abstract'],
        body: UniswapExecuteQuoteRequest,
        response: { 200: SwapExecuteResponse },
      },
    },
    async (request) => {
      try {
        const { walletAddress = chainConfig.defaultWallet, quoteId } =
          request.body as typeof UniswapExecuteQuoteRequest._type;

        const network = 'abstract'; // Force Abstract network
        logger.info(`[uniswap-abstract/POST /execute-quote] Executing quote on Abstract network`);

        return await executeQuote(fastify, walletAddress, network, quoteId);
      } catch (e: any) {
        if (e.statusCode) throw e;
        logger.error('[uniswap-abstract/execute-quote] Error executing quote:', e);
        throw fastify.httpErrors.internalServerError(e.message || 'Internal server error');
      }
    },
  );
};

export default executeQuoteRoute;
