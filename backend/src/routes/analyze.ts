import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createJob } from '../services/jobs/queue';
import { AppError } from '../utils/errors';
import { logger } from '../logger';

export async function analyzeRoutes(fastify: FastifyInstance) {
  fastify.post('/api/analyze', async (request, reply) => {
    const debugEnabled = process.env.NODE_ENV !== 'production' && process.env.LOG_LEVEL === 'debug';
    try {
      let text: string | undefined;
      let fileBuffer: Buffer | undefined;
      let fileName: string | undefined;
      const fileMeta: { fieldname: string; filename?: string; mimetype?: string; size?: number }[] = [];

      if (request.isMultipart()) {
        const parts: Record<string, string> = {};
        if (debugEnabled) {
          logger.debug(
            {
              content_type: request.headers['content-type'],
              content_length: request.headers['content-length']
            },
            'Analyze multipart request received'
          );
        }
        for await (const part of request.parts()) {
          if (part.type === 'file') {
            const buffers: Buffer[] = [];
            let size = 0;
            for await (const chunk of part.file) {
              buffers.push(chunk as Buffer);
              size += (chunk as Buffer).length;
            }
            fileBuffer = Buffer.concat(buffers);
            fileName = part.filename;
            fileMeta.push({
              fieldname: part.fieldname,
              filename: part.filename,
              mimetype: part.mimetype,
              size
            });
          } else if (part.type === 'field') {
            parts[part.fieldname] = String(part.value);
          }
        }
        text = parts['text'];
        if (debugEnabled) {
          logger.debug({ parts: { fields: Object.keys(parts), files: fileMeta } }, 'Analyze multipart parts parsed');
        }
      } else {
        const body = request.body as { text?: string };
        text = body?.text;
        if (debugEnabled) {
          logger.debug(
            {
              content_type: request.headers['content-type'],
              content_length: request.headers['content-length'],
              keys: body ? Object.keys(body) : []
            },
            'Analyze JSON request received'
          );
        }
      }

      const job = await createJob({ text, fileBuffer, fileName });
      if (job.status === 'failed') {
        return reply.status(400).send({
          code: 'BAD_REQUEST',
          error: job.error,
          details: { jobId: job.id }
        });
      }
      return reply.code(202).send({ jobId: job.id });
    } catch (err) {
      logger.error({ err, stack: err instanceof Error ? err.stack : undefined }, 'Analyze request failed');
      const status = err instanceof AppError ? err.statusCode : 500;
      const message =
        err instanceof AppError
          ? err.message
          : err instanceof z.ZodError
            ? 'درخواست نامعتبر است.'
            : 'خطای داخلی سرور.';
      const details =
        err instanceof z.ZodError
          ? { issues: err.issues }
          : err instanceof AppError
            ? undefined
            : { reason: 'unexpected_error' };
      return reply.status(status).send({
        code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
        error: message,
        details
      });
    }
  });
}
