import { z } from 'zod';
import { CoverageEntry, CoverageEntrySchema } from '../../schemas/modules';
import { module2CoveragePrompt } from '../../prompts/module2-coverage';
import { callStructuredLLM } from '../../services/llm/client';

const modulesList = ['trends', 'weak_signals', 'critical_uncertainties', 'scenarios', 'roadmapping'];

function fallbackCoverage(text: string): CoverageEntry[] {
  const statusFromLength = (len: number): 'active' | 'partial' | 'inactive' => {
    if (len > 1200) return 'active';
    if (len > 400) return 'partial';
    return 'inactive';
  };

  const baseStatus = statusFromLength(text.length);
  const entries: CoverageEntry[] = modulesList.map((module) =>
    CoverageEntrySchema.parse({
      module,
      status: module === 'scenarios' ? 'inactive' : baseStatus,
      missing_information: []
    })
  );

  const uncertainties = entries.find((e) => e.module === 'critical_uncertainties');
  const scenarios = entries.find((e) => e.module === 'scenarios');
  if (uncertainties && (uncertainties.status === 'active' || uncertainties.status === 'partial')) {
    if (text.length > 800 && scenarios) {
      scenarios.status = 'partial';
    }
  }

  entries.forEach((entry) => {
    if (entry.status !== 'active') {
      entry.missing_information.push('داده کافی برای پوشش کامل وجود ندارد');
    }
  });
  return entries;
}

export async function runModule2Coverage(text: string): Promise<CoverageEntry[]> {
  const schema = z.object({ coverage: z.array(CoverageEntrySchema) });
  const result = await callStructuredLLM<{ coverage: CoverageEntry[] }>({
    prompt: module2CoveragePrompt,
    input: { text: text.slice(0, 6000), modules: modulesList },
    schema,
    fallback: () => ({ coverage: fallbackCoverage(text) })
  });
  return result.coverage;
}
