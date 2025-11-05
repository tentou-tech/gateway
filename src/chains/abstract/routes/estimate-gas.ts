import { FastifyPluginAsync, FastifyInstance } from 'fastify';

import { EstimateGasRequestType, EstimateGasResponse, EstimateGasResponseSchema } from '../../../schemas/chain-schema';
import { logger } from '../../../services/logger';
import { estimateGasEthereum } from '../../ethereum/routes/estimate-gas';
import { AbstractEstimateGasRequest } from '../schemas';

export async function estimateGasAbstract(fastify: FastifyInstance): Promise<EstimateGasResponse> {
  try {
    // Delegate to Ethereum with network='abstract'
    return await estimateGasEthereum(fastify, 'abstract');
  } catch (error) {
    logger.error(`Error estimating gas for Abstract: ${error.message}`);
    throw error;
  }
}

export const estimateGasRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: EstimateGasRequestType;
    Reply: EstimateGasResponse;
  }>(
    '/estimate-gas',
    {
      schema: {
        description: 'Estimate gas prices for Abstract transactions',
        tags: ['/chain/abstract'],
        querystring: AbstractEstimateGasRequest,
        response: {
          200: EstimateGasResponseSchema,
        },
      },
    },
    async (_request) => {
      return await estimateGasAbstract(fastify);
    },
  );
};

export default estimateGasRoute;
