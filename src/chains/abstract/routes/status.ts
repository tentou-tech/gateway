import { FastifyPluginAsync } from 'fastify';

import { StatusRequestType, StatusResponseType, StatusResponseSchema } from '../../../schemas/chain-schema';
import { logger } from '../../../services/logger';
import { Abstract } from '../abstract';
import { AbstractStatusRequest } from '../schemas';

export async function getAbstractStatus(): Promise<StatusResponseType> {
  try {
    const abstract = await Abstract.getInstance();
    const ethereum = abstract.getEthereumInstance();
    const chain = 'abstract';
    const network = 'abstract';
    const rpcUrl = ethereum.rpcUrl;
    const rpcProvider = 'url'; // Abstract uses standard RPC
    const nativeCurrency = ethereum.nativeTokenSymbol;

    // Get the current block number with a timeout
    let currentBlockNumber = 0;
    try {
      const blockPromise = ethereum.provider.getBlockNumber();
      const timeoutPromise = new Promise<number>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 5000);
      });

      currentBlockNumber = await Promise.race([blockPromise, timeoutPromise]);
    } catch (blockError) {
      logger.warn(`Failed to get block number: ${blockError.message}`);
    }

    return {
      chain,
      network,
      rpcUrl,
      rpcProvider,
      currentBlockNumber,
      nativeCurrency,
    };
  } catch (error) {
    logger.error(`Error getting Abstract status: ${error.message}`);
    throw new Error(`Failed to get Abstract status: ${error.message}`);
  }
}

export const statusRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: StatusRequestType;
    Reply: StatusResponseType;
  }>(
    '/status',
    {
      schema: {
        description: 'Get Abstract chain status',
        tags: ['/chain/abstract'],
        querystring: AbstractStatusRequest,
        response: {
          200: StatusResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      try {
        return await getAbstractStatus();
      } catch (error) {
        logger.error(`Error in Abstract status endpoint: ${error.message}`);
        reply.status(500);
        return {
          chain: 'abstract',
          network: 'abstract',
          rpcUrl: 'unavailable',
          rpcProvider: 'unavailable',
          currentBlockNumber: 0,
          nativeCurrency: 'ETH',
        };
      }
    },
  );
};

export default statusRoute;
