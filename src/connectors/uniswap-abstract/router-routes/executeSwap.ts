import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { ExecuteSwapRequestType, SwapExecuteResponseType, SwapExecuteResponse } from '../../../schemas/router-schema';
import { logger } from '../../../services/logger';

// Import the quote and execute functions from regular uniswap
import { executeQuote } from '../../uniswap/router-routes/executeQuote';
import { quoteSwap } from '../../uniswap/router-routes/quoteSwap';
import { UniswapExecuteSwapRequest } from '../../uniswap/schemas';

async function executeSwap(
  fastify: FastifyInstance,
  walletAddress: string,
  baseToken: string,
  quoteToken: string,
  amount: number,
  side: 'BUY' | 'SELL',
  slippagePct: number,
): Promise<SwapExecuteResponseType> {
  const network = 'abstract'; // Force Abstract network
  logger.info(
    `[uniswap-abstract/executeSwap] Executing swap on Abstract: ${amount} ${baseToken} ${side} for ${quoteToken}`,
  );

  // Step 1: Get quote
  const quoteResponse = await quoteSwap(
    fastify,
    network,
    walletAddress,
    baseToken,
    quoteToken,
    amount,
    side,
    slippagePct,
  );

  // Step 2: Execute the quote
  const executeResponse = await executeQuote(fastify, walletAddress, network, quoteResponse.quoteId);

  return executeResponse;
}

export const executeSwapRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: ExecuteSwapRequestType;
    Reply: SwapExecuteResponseType;
  }>(
    '/execute-swap',
    {
      schema: {
        description: 'Quote and execute a token swap on Uniswap Universal Router on Abstract network in one step',
        tags: ['/connector/uniswap-abstract'],
        body: UniswapExecuteSwapRequest,
        response: { 200: SwapExecuteResponse },
      },
    },
    async (request) => {
      try {
        const { walletAddress, baseToken, quoteToken, amount, side, slippagePct } =
          request.body as typeof UniswapExecuteSwapRequest._type;

        logger.info(`[uniswap-abstract/POST /execute-swap] Forcing network to 'abstract'`);

        return await executeSwap(
          fastify,
          walletAddress,
          baseToken,
          quoteToken,
          amount,
          side as 'BUY' | 'SELL',
          slippagePct,
        );
      } catch (e: any) {
        if (e.statusCode) throw e;
        logger.error('[uniswap-abstract/execute-swap] Error executing swap:', e);
        throw fastify.httpErrors.internalServerError(e.message || 'Internal server error');
      }
    },
  );
};

export default executeSwapRoute;
