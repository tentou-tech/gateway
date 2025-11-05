import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { logger } from '../../../services/logger';
import { approveEthereumToken } from '../../ethereum/routes/approve';
import { ApproveRequestSchema, ApproveRequestType, ApproveResponseSchema, ApproveResponseType } from '../schemas';

export async function approveAbstractToken(
  fastify: FastifyInstance,
  address: string,
  spender: string,
  token: string,
  amount?: string,
) {
  try {
    // Delegate to Ethereum with network='abstract'
    return await approveEthereumToken(fastify, 'abstract', address, spender, token, amount);
  } catch (error) {
    logger.error(`Error approving Abstract token: ${error.message}`);
    throw error;
  }
}

export const approveRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: ApproveRequestType;
    Reply: ApproveResponseType;
  }>(
    '/approve',
    {
      schema: {
        description:
          'Approve token spending on Abstract chain. Handles Permit2 for uniswap-abstract/router automatically.',
        tags: ['/chain/abstract'],
        body: ApproveRequestSchema,
        response: {
          200: ApproveResponseSchema,
        },
      },
    },
    async (request) => {
      const { address, spender, token, amount } = request.body;
      return await approveAbstractToken(fastify, address, spender, token, amount);
    },
  );
};

export default approveRoute;
