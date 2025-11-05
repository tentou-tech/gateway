import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { BalanceRequestType, BalanceResponseType, BalanceResponseSchema } from '../../../schemas/chain-schema';
import { logger } from '../../../services/logger';
import { Abstract } from '../abstract';
import { AbstractBalanceRequest } from '../schemas';

export async function getAbstractBalances(
  fastify: FastifyInstance,
  address: string,
  tokens?: string[],
): Promise<BalanceResponseType> {
  try {
    const abstract = await Abstract.getInstance();
    const ethereum = abstract.getEthereumInstance();
    const balances = await ethereum.getBalances(address, tokens);
    return { balances };
  } catch (error) {
    logger.error(`Error getting balances: ${error.message}`);
    throw fastify.httpErrors.internalServerError(`Failed to get balances: ${error.message}`);
  }
}

export const balancesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: BalanceRequestType;
    Reply: BalanceResponseType;
  }>(
    '/balances',
    {
      schema: {
        description:
          'Get Abstract balances. If no tokens specified or empty array provided, returns native token (ETH) and only non-zero balances for tokens from the token list. If specific tokens are requested, returns those exact tokens with their balances, including zeros.',
        tags: ['/chain/abstract'],
        body: AbstractBalanceRequest,
        response: {
          200: BalanceResponseSchema,
        },
      },
    },
    async (request) => {
      const { address, tokens } = request.body;
      return await getAbstractBalances(fastify, address, tokens);
    },
  );
};

export default balancesRoute;
