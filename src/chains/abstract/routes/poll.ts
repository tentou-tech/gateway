import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { PollRequestType, PollResponseType, PollResponseSchema } from '../../../schemas/chain-schema';
import { logger } from '../../../services/logger';
import { pollEthereumTransaction } from '../../ethereum/routes/poll';
import { AbstractPollRequest } from '../schemas';

export async function pollAbstractTransaction(
  fastify: FastifyInstance,
  signature: string,
  connector?: string,
): Promise<PollResponseType> {
  try {
    // Delegate to Ethereum with network='abstract'
    return await pollEthereumTransaction(fastify, 'abstract', signature, connector);
  } catch (error) {
    logger.error(`Error polling Abstract transaction: ${error.message}`);
    throw error;
  }
}

export const pollRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: PollRequestType;
    Reply: PollResponseType;
  }>(
    '/poll',
    {
      schema: {
        description: 'Poll Abstract transaction status',
        tags: ['/chain/abstract'],
        body: AbstractPollRequest,
        response: {
          200: PollResponseSchema,
        },
      },
    },
    async (request) => {
      const { signature } = request.body;
      return await pollAbstractTransaction(fastify, signature);
    },
  );
};

export default pollRoute;
