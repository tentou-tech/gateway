import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { logger } from '../../../services/logger';
import { wrapEthereum } from '../../ethereum/routes/wrap';
import { WrapRequestSchema, WrapRequestType, WrapResponseSchema, WrapResponseType } from '../schemas';

export async function wrapAbstractToken(
  fastify: FastifyInstance,
  address: string,
  amount: string,
): Promise<WrapResponseType> {
  try {
    // Delegate to Ethereum with network='abstract'
    return await wrapEthereum(fastify, 'abstract', address, amount);
  } catch (error) {
    logger.error(`Error wrapping Abstract token: ${error.message}`);
    throw error;
  }
}

export const wrapRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: WrapRequestType;
    Reply: WrapResponseType;
  }>(
    '/wrap',
    {
      schema: {
        description: 'Wrap native ETH to WETH on Abstract chain',
        tags: ['/chain/abstract'],
        body: WrapRequestSchema,
        response: {
          200: WrapResponseSchema,
        },
      },
    },
    async (request) => {
      const { address, amount } = request.body;
      return await wrapAbstractToken(fastify, address, amount);
    },
  );
};

export default wrapRoute;
