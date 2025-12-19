import { nanoid } from 'nanoid';
import { z } from 'zod';
import { Chunk } from '../../schemas/common';
import { EvidenceItem, EvidenceItemSchema } from '../../schemas/modules';
import { module4EvidencePrompt } from '../../prompts/module4-evidence';
import { callStructuredLLM } from '../../services/llm/client';

function fallbackEvidence(chunks: Chunk[]): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  const kinds: EvidenceItem['kind'][] = ['claim', 'actor', 'event', 'metric'];
  chunks.forEach((chunk, idx) => {
    const sentences = chunk.text
      .split(/[\.\!\؟\?]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    sentences.slice(0, 2).forEach((sentence, sIdx) => {
      const item = EvidenceItemSchema.parse({
        id: `e-${nanoid(6)}`,
        kind: kinds[(idx + sIdx) % kinds.length],
        chunk_id: chunk.chunk_id,
        snippet: sentence.slice(0, 160),
        content: sentence
      });
      evidence.push(item);
    });
  });

  if (evidence.length === 0 && chunks[0]) {
    evidence.push(
      EvidenceItemSchema.parse({
        id: `e-${nanoid(6)}`,
        kind: 'claim',
        chunk_id: chunks[0].chunk_id,
        snippet: chunks[0].text.slice(0, 160),
        content: chunks[0].text.slice(0, 200)
      })
    );
  }

  return evidence;
}

export async function runModule4Evidence(chunks: Chunk[]): Promise<EvidenceItem[]> {
  const schema = z.object({ items: z.array(EvidenceItemSchema) });
  const result = await callStructuredLLM<{ items: EvidenceItem[] }>({
    prompt: module4EvidencePrompt,
    input: { chunks: chunks.map((c) => ({ chunk_id: c.chunk_id, text: c.text })) },
    schema,
    fallback: () => ({ items: fallbackEvidence(chunks) })
  });
  return result.items;
}
