import { FastifyInstance } from 'fastify';
import { env } from '../config/env';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      providerConfigured: !!env.LLM_API_KEY && !env.DEMO_MODE,
      model: env.LLM_MODEL,
      version: '0.1.0',
      uptimeSeconds: process.uptime()
    };
  });
}
