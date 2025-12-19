import { FastifyInstance } from 'fastify';
import { createJob } from '../services/jobs/queue';
import { AppError } from '../utils/errors';

export async function analyzeRoutes(fastify: FastifyInstance) {
  fastify.post('/api/analyze', async (request, reply) => {
    try {
      let text: string | undefined;
      let fileBuffer: Buffer | undefined;
      let fileName: string | undefined;

      if (request.isMultipart()) {
        const parts: Record<string, string> = {};
        for await (const part of request.parts()) {
          if (part.type === 'file') {
            const buffers: Buffer[] = [];
            for await (const chunk of part.file) {
              buffers.push(chunk as Buffer);
            }
            fileBuffer = Buffer.concat(buffers);
            fileName = part.filename;
          } else if (part.type === 'field') {
            parts[part.fieldname] = String(part.value);
          }
        }
        text = parts['text'];
      } else {
        const body = request.body as { text?: string };
        text = body?.text;
      }

      const job = await createJob({ text, fileBuffer, fileName });
      return reply.code(202).send({ jobId: job.id });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'در پردازش درخواست خطا رخ داد';
      const status = err instanceof AppError ? err.statusCode : 500;
      return reply.status(status).send({ error: message });
    }
  });
}
