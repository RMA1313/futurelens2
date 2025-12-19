import { z } from 'zod';

export const ChunkSchema = z.object({
  chunk_id: z.string(),
  text: z.string()
});
export type Chunk = z.infer<typeof ChunkSchema>;

export const ModuleStatusSchema = z.enum(['active', 'partial', 'inactive']);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

export const JobStatusSchema = z.enum(['queued', 'running', 'succeeded', 'failed']);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const FactLabelSchema = z.enum(['fact', 'inference', 'assumption']);
export type FactLabel = z.infer<typeof FactLabelSchema>;
