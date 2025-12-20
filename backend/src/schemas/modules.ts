import { z } from 'zod';
import { FactLabelSchema, ModuleStatusSchema } from './common';

export const DocumentClassifierSchema = z.object({
  document_type: z.string(),
  domain: z.string(),
  horizon: z.string(),
  analytical_level: z.string()
});
export type DocumentClassifier = z.infer<typeof DocumentClassifierSchema>;

export const CoverageEntrySchema = z.object({
  module: z.string(),
  status: ModuleStatusSchema,
  missing_information: z.array(z.string()).default([])
});
export type CoverageEntry = z.infer<typeof CoverageEntrySchema>;

export const ClarificationQuestionSchema = z.object({
  id: z.string(),
  module: z.string(),
  question: z.string()
});
export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;

export const ClarificationOutputSchema = z.object({
  questions: z.array(ClarificationQuestionSchema).default([])
});
export type ClarificationOutput = z.infer<typeof ClarificationOutputSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['claim', 'actor', 'event', 'metric']),
  chunk_id: z.string(),
  snippet: z.string(),
  content: z.string(),
  page: z.number().optional(),
  label_type: FactLabelSchema.optional(),
  confidence: z.number().min(0).max(1).optional()
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const TrendItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(['mega', 'trend', 'micro']),
  direction: z.string(),
  strength: z.string(),
  evidence_ids: z.array(z.string()).default([]),
  label_type: FactLabelSchema.optional(),
  confidence: z.number().min(0).max(1).optional()
});
export type TrendItem = z.infer<typeof TrendItemSchema>;

export const WeakSignalItemSchema = z.object({
  id: z.string(),
  signal: z.string(),
  rationale: z.string(),
  evolution: z.string(),
  evidence_ids: z.array(z.string()).default([]),
  label_type: FactLabelSchema.optional(),
  confidence: z.number().min(0).max(1).optional()
});
export type WeakSignalItem = z.infer<typeof WeakSignalItemSchema>;

export const CriticalUncertaintySchema = z.object({
  id: z.string(),
  driver: z.string(),
  impact: z.string(),
  uncertainty_reason: z.string(),
  evidence_ids: z.array(z.string()).default([]),
  label_type: FactLabelSchema.optional(),
  confidence: z.number().min(0).max(1).optional()
});
export type CriticalUncertainty = z.infer<typeof CriticalUncertaintySchema>;

export const CriticLabelSchema = z.object({
  item_ref: z.string(),
  label: FactLabelSchema,
  confidence: z.number().min(0).max(1).default(0.5),
  note: z.string().optional()
});

export const CriticOutputSchema = z.object({
  contradictions: z.array(z.string()).default([]),
  unsupported: z.array(z.string()).default([]),
  labels: z.array(CriticLabelSchema).default([])
});
export type CriticOutput = z.infer<typeof CriticOutputSchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  implications: z.array(z.string()).default([]),
  indicators: z.array(z.string()).default([])
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const SteepdSchema = z.object({
  social: z.array(z.string()).default([]),
  technological: z.array(z.string()).default([]),
  economic: z.array(z.string()).default([]),
  environmental: z.array(z.string()).default([]),
  political: z.array(z.string()).default([]),
  defense: z.array(z.string()).default([])
});
export type Steepd = z.infer<typeof SteepdSchema>;

export const OutputComposerSchema = z.object({
  executive_brief: z.string(),
  executive_summary: z.string().optional(),
  executive_key_points: z.array(z.string()).optional(),
  full_report: z.string(),
  steepd: SteepdSchema.optional(),
  dashboard: z.object({
    document_profile: DocumentClassifierSchema,
    coverage: z.array(CoverageEntrySchema),
    clarification_questions: z.array(ClarificationQuestionSchema),
    trends: z.array(TrendItemSchema),
    weak_signals: z.array(WeakSignalItemSchema),
    critical_uncertainties: z.array(CriticalUncertaintySchema),
    scenarios: z.array(ScenarioSchema).optional(),
    evidence: z.array(EvidenceItemSchema),
    extraction_quality: z
      .object({
        status: z.enum(['ok', 'low']),
        message: z.string().optional()
      })
      .optional()
  })
});
export type OutputComposer = z.infer<typeof OutputComposerSchema>;

export const PipelineOutputsSchema = z.object({
  classifier: DocumentClassifierSchema.optional(),
  coverage: z.array(CoverageEntrySchema).optional(),
  clarifications: ClarificationOutputSchema.optional(),
  evidence: z.array(EvidenceItemSchema).optional(),
  trends: z.array(TrendItemSchema).optional(),
  weak_signals: z.array(WeakSignalItemSchema).optional(),
  critical_uncertainties: z.array(CriticalUncertaintySchema).optional(),
  critic: CriticOutputSchema.optional(),
  scenarios: z.array(ScenarioSchema).optional(),
  report: OutputComposerSchema.optional()
});
export type PipelineOutputs = z.infer<typeof PipelineOutputsSchema>;
