import { z } from 'zod';

export const HealthSchema = z.object({
  status: z.string(),
  providerConfigured: z.boolean().optional(),
  model: z.string().optional(),
  version: z.string().optional(),
  uptimeSeconds: z.number().optional()
});

export const AnalyzeResponseSchema = z.object({
  jobId: z.string()
});

export const ClarificationQuestionSchema = z.object({
  id: z.string(),
  module: z.string(),
  question: z.string()
});

export const ClarificationAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string()
});

export const CoverageEntrySchema = z.object({
  module: z.string(),
  status: z.enum(['active', 'partial', 'inactive']),
  missing_information: z.array(z.string()).optional()
});

export const JobStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['queued', 'running', 'succeeded', 'failed']),
  progress: z.number().min(0).max(1),
  outputs: z
    .object({
      coverage: z.array(CoverageEntrySchema).optional(),
      clarifications: z
        .object({
          questions: z.array(ClarificationQuestionSchema).optional()
        })
        .optional()
    })
    .optional(),
  clarifications: z
    .object({
      questions: z.array(ClarificationQuestionSchema).optional(),
      answers: z.array(ClarificationAnswerSchema).optional()
    })
    .optional(),
  error: z.string().optional()
});

export type Health = z.infer<typeof HealthSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;
export type ClarificationAnswer = z.infer<typeof ClarificationAnswerSchema>;
export type CoverageEntry = z.infer<typeof CoverageEntrySchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string(),
  kind: z.string(),
  chunk_id: z.string(),
  snippet: z.string(),
  content: z.string().optional(),
  page: z.number().optional(),
  label_type: z.enum(['fact', 'inference', 'assumption']).optional(),
  confidence: z.number().optional()
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const TrendItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
  direction: z.string().optional(),
  strength: z.string().optional(),
  evidence_ids: z.array(z.string()).optional(),
  label_type: z.enum(['fact', 'inference', 'assumption']).optional(),
  confidence: z.number().optional(),
  rationale: z.string().optional()
});
export type TrendItem = z.infer<typeof TrendItemSchema>;

export const WeakSignalSchema = z.object({
  id: z.string(),
  signal: z.string(),
  rationale: z.string().optional(),
  evolution: z.string().optional(),
  evidence_ids: z.array(z.string()).optional(),
  label_type: z.enum(['fact', 'inference', 'assumption']).optional(),
  confidence: z.number().optional()
});
export type WeakSignal = z.infer<typeof WeakSignalSchema>;

export const UncertaintySchema = z.object({
  id: z.string(),
  driver: z.string(),
  impact: z.string().optional(),
  uncertainty_reason: z.string().optional(),
  evidence_ids: z.array(z.string()).optional(),
  label_type: z.enum(['fact', 'inference', 'assumption']).optional(),
  confidence: z.number().optional()
});
export type Uncertainty = z.infer<typeof UncertaintySchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  implications: z.array(z.string()).optional(),
  indicators: z.array(z.string()).optional(),
  evidence_ids: z.array(z.string()).optional(),
  confidence: z.number().optional()
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ScenarioStatusSchema = z.object({
  status: z.enum(['ok', 'insufficient_data']),
  reason: z.string().optional(),
  missing_information: z.array(z.string()).optional()
});
export type ScenarioStatus = z.infer<typeof ScenarioStatusSchema>;

export const DocumentProfileSchema = z.object({
  document_type: z.string(),
  domain: z.string(),
  horizon: z.string(),
  analytical_level: z.string(),
  limitations: z.array(z.string()).optional()
});
export type DocumentProfile = z.infer<typeof DocumentProfileSchema>;

export const ReportSchema = z.object({
  executive_brief: z.string().optional(),
  full_report: z.string().optional(),
  dashboard: z.object({
    document_profile: DocumentProfileSchema.optional(),
    coverage: z.array(CoverageEntrySchema).optional(),
    clarification_questions: z.array(ClarificationQuestionSchema).optional(),
    trends: z.array(TrendItemSchema).optional(),
    weak_signals: z.array(WeakSignalSchema).optional(),
    critical_uncertainties: z.array(UncertaintySchema).optional(),
    scenarios: z.array(ScenarioSchema).optional(),
    scenarios_status: ScenarioStatusSchema.optional(),
    evidence: z.array(EvidenceItemSchema).optional(),
    extraction_quality: z
      .object({
        status: z.enum(['ok', 'low']),
        message: z.string().optional()
      })
      .optional()
  })
});
export type Report = z.infer<typeof ReportSchema>;
