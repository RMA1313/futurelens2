import { z } from 'zod';
import { nanoid } from 'nanoid';
import { CriticalUncertainty, Scenario, ScenarioSchema } from '../../schemas/modules';
import { module7ScenariosPrompt } from '../../prompts/module7-scenarios';
import { callStructuredLLM } from '../../services/llm/client';

function fallbackScenarios(uncertainties: CriticalUncertainty[]): Scenario[] {
  if (uncertainties.length < 2) return [];
  const [first, second] = uncertainties;
  if (!first || !second) return [];

  const scenarios: Scenario[] = [
    ScenarioSchema.parse({
      id: `s-${nanoid(5)}`,
      title: 'پیشروی شتابان',
      summary: `حل عدم قطعیت‌های ${first.driver} و ${second.driver} باعث رشد سریع می‌شود.`,
      implications: ['آمادگی زیرساخت و سرمایه انسانی ضروری است', 'رقابت منطقه‌ای افزایش می‌یابد'],
      indicators: ['تصویب مقررات حمایتی', 'افزایش سرمایه‌گذاری خارجی']
    }),
    ScenarioSchema.parse({
      id: `s-${nanoid(5)}`,
      title: 'توقف و بازنگری',
      summary: `ابهام در ${first.driver} یا ${second.driver} سرعت توسعه را کند می‌کند.`,
      implications: ['تعویق یا کوچک‌سازی پروژه‌ها', 'انتقال منابع به حوزه‌های کم‌ریسک‌تر'],
      indicators: ['تشدید محدودیت‌های قانونی', 'کاهش بودجه تخصیصی']
    })
  ];

  return scenarios;
}

export async function runModule7Scenarios(
  uncertainties: CriticalUncertainty[]
): Promise<Scenario[]> {
  if (uncertainties.length < 2) return [];
  const schema = z.object({ scenarios: z.array(ScenarioSchema) });
  const result = await callStructuredLLM<{ scenarios: Scenario[] }>({
    prompt: module7ScenariosPrompt,
    input: { critical_uncertainties: uncertainties },
    schema,
    fallback: () => ({ scenarios: fallbackScenarios(uncertainties) })
  });
  return result.scenarios;
}
