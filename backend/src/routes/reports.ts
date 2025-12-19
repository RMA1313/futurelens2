import { FastifyInstance } from 'fastify';
import { getJob } from '../services/jobs/queue';

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.get('/api/jobs/:id/report', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = getJob(id);
    if (!job) {
      return reply.status(404).send({ error: 'شغل پیدا نشد' });
    }
    if (job.status !== 'succeeded' || !job.outputs.report) {
      return reply
        .status(409)
        .send({ error: 'گزارش نهایی هنوز آماده نیست', status: job.status });
    }
    return job.outputs.report;
  });
}
