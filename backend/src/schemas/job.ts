import { z } from 'zod';
import { ChunkSchema, JobStatusSchema } from './common';
import {
  ClarificationQuestionSchema,
  OutputComposerSchema,
  PipelineOutputsSchema
} from './modules';

export const ClarificationAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string()
});
export type ClarificationAnswer = z.infer<typeof ClarificationAnswerSchema>;

export const AnalyzeRequestSchema = z
  .object({
    text: z.string().optional(),
    fileName: z.string().optional(),
    fileBuffer: z.instanceof(Buffer).optional()
  })
  .refine((val) => !!val.text || (!!val.fileName && !!val.fileBuffer), {
    message: 'متن یا فایل لازم است'
  });
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const JobDataSchema = z.object({
  id: z.string(),
  status: JobStatusSchema,
  progress: z.number().min(0).max(1),
  input: z.object({
    text: z.string().optional(),
    fileName: z.string().optional()
  }),
  chunks: z.array(ChunkSchema),
  outputs: PipelineOutputsSchema.default({}),
  clarifications: z.object({
    questions: z.array(ClarificationQuestionSchema).default([]),
    answers: z.array(ClarificationAnswerSchema).default([])
  }),
  report: OutputComposerSchema.optional(),
  error: z.string().optional(),
  demoMode: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});
export type JobData = z.infer<typeof JobDataSchema>;
