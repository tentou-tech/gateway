import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { logger } from '../../../services/logger';
import { unwrapEthereum } from '../../ethereum/routes/unwrap';
import { UnwrapRequestSchema, UnwrapRequestType, UnwrapResponseSchema, UnwrapResponseType } from '../schemas';

export async function unwrapAbstractToken(
  fastify: FastifyInstance,
  address: string,
  amount: string,
): Promise<UnwrapResponseType> {
  try {
    // Delegate to Ethereum with network='abstract'
    return await unwrapEthereum(fastify, 'abstract', address, amount);
  } catch (error) {
    logger.error(`Error unwrapping Abstract token: ${error.message}`);
    throw error;
  }
}

export const unwrapRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: UnwrapRequestType;
    Reply: UnwrapResponseType;
  }>(
    '/unwrap',
    {
      schema: {
        description: 'Unwrap WETH to native ETH on Abstract chain',
        tags: ['/chain/abstract'],
        body: UnwrapRequestSchema,
        response: {
          200: UnwrapResponseSchema,
        },
      },
    },
    async (request) => {
      const { address, amount } = request.body;
      return await unwrapAbstractToken(fastify, address, amount);
    },
  );
};

export default unwrapRoute;
