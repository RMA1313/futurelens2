import { FastifyInstance } from 'fastify';
import { getJob } from '../services/jobs/queue';

export async function jobRoutes(fastify: FastifyInstance) {
  fastify.get('/api/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = getJob(id);
    if (!job) {
      return reply.status(404).send({ error: 'شغل پیدا نشد' });
    }
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      outputs: job.outputs,
      clarifications: job.clarifications,
      error: job.error
    };
  });
}
