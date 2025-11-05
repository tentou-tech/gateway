import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { logger } from '../../../services/logger';
import { getEthereumAllowances } from '../../ethereum/routes/allowances';
import {
  AbstractAddressParameter,
  AllowancesRequestSchema,
  AllowancesRequestType,
  AllowancesResponseSchema,
  AllowancesResponseType,
} from '../schemas';

export async function getAbstractAllowances(
  fastify: FastifyInstance,
  address: string,
  spender: string,
  tokens: string[],
) {
  try {
    // Delegate to Ethereum with network='abstract'
    return await getEthereumAllowances(fastify, 'abstract', address, spender, tokens);
  } catch (error) {
    logger.error(`Error getting Abstract allowances: ${error.message}`);
    throw error;
  }
}

export const allowancesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: AllowancesRequestType;
    Reply: AllowancesResponseType;
  }>(
    '/allowances',
    {
      schema: {
        description: 'Get token allowances on Abstract chain',
        tags: ['/chain/abstract'],
        body: AllowancesRequestSchema,
        response: {
          200: AllowancesResponseSchema,
        },
      },
    },
    async (request) => {
      const { address, spender, tokens } = request.body;
      return await getAbstractAllowances(fastify, address, spender, tokens);
    },
  );
};

export default allowancesRoute;
