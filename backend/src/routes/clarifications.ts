import { FastifyInstance } from 'fastify';
import { submitClarifications } from '../services/jobs/queue';
import { AppError } from '../utils/errors';

export async function clarificationRoutes(fastify: FastifyInstance) {
  fastify.post('/api/jobs/:id/clarifications', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { answers: { questionId: string; answer: string }[] };
    try {
      const job = await submitClarifications(id, body?.answers ?? []);
      return reply.code(202).send({ jobId: job.id, status: job.status });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'در ثبت پاسخ خطا رخ داد';
      const status = err instanceof AppError ? err.statusCode : 500;
      return reply.status(status).send({ error: message });
    }
  });
}
