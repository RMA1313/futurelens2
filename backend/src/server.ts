import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { nanoid } from 'nanoid';
import { env } from './config/env';
import { logger } from './logger';
import { healthRoutes } from './routes/health';
import { analyzeRoutes } from './routes/analyze';
import { jobRoutes } from './routes/jobs';
import { reportRoutes } from './routes/reports';
import { clarificationRoutes } from './routes/clarifications';

export async function buildServer() {
  const fastify = Fastify({
    logger: false,
    loggerInstance: logger,
    genReqId: () => nanoid(12),
    bodyLimit: 50 * 1024 * 1024
  });

  await fastify.register(cors, { origin: true });
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS
  });
  await fastify.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });

  await fastify.register(healthRoutes);
  await fastify.register(analyzeRoutes);
  await fastify.register(jobRoutes);
  await fastify.register(reportRoutes);
  await fastify.register(clarificationRoutes);

  fastify.setErrorHandler((error, request, reply) => {
    request.log.error({ error, stack: error instanceof Error ? error.stack : undefined }, 'Unhandled error');
    if (!reply.sent) {
      reply.status(500).send({
        code: 'INTERNAL_ERROR',
        error: 'خطای داخلی سرور.'
      });
    }
  });

  return fastify;
}

async function start() {
  const server = await buildServer();
  server.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      logger.error({ err, stack: err.stack }, 'خطا در راه‌اندازی سرور');
      process.exit(1);
    }
    logger.info({ address }, 'سرور FutureLenz آماده است');
  });
}

if (require.main === module) {
  start();
}
