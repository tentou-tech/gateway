import sensible from '@fastify/sensible';
import { FastifyPluginAsync } from 'fastify';

// Import routes
import { uniswapAbstractRouterRoutes } from './router-routes';

// Router routes (Universal Router - Abstract only)
const uniswapAbstractRouterRoutesWrapper: FastifyPluginAsync = async (fastify) => {
  await fastify.register(sensible);

  await fastify.register(async (instance) => {
    instance.addHook('onRoute', (routeOptions) => {
      if (routeOptions.schema && routeOptions.schema.tags) {
        routeOptions.schema.tags = ['/connector/uniswap-abstract'];
      }
    });

    await instance.register(uniswapAbstractRouterRoutes);
  });
};

// Export routes
export const uniswapAbstractRoutes = {
  router: uniswapAbstractRouterRoutesWrapper,
};

export default uniswapAbstractRoutes;
