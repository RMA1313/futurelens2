import { nanoid } from 'nanoid';
import { z } from 'zod';
import { Chunk } from '../../schemas/common';
import { EvidenceItem, EvidenceItemSchema } from '../../schemas/modules';
import { module4EvidencePrompt } from '../../prompts/module4-evidence';
import { callStructuredLLM } from '../../services/llm/client';
import { AppError } from '../../utils/errors';

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
  const sanitized = sanitizeEvidence(result.items, chunks);
  if (!sanitized.length) {
    return fallbackEvidence(chunks);
  }
  return sanitized;
}

function sanitizeEvidence(items: EvidenceItem[], chunks: Chunk[]) {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.chunk_id, chunk]));
  const sanitized: EvidenceItem[] = [];
  for (const item of items) {
    const chunk = chunkMap.get(item.chunk_id);
    if (!chunk) continue;
    if (containsPdfInternals(chunk.text)) {
      throw new AppError('متن استخراج‌شده قابل اعتماد نیست.', 400);
    }
    const content = deriveContent(chunk.text, item.content || item.snippet || '');
    const snippet = deriveSnippet(chunk.text, content);
    if (containsPdfInternals(snippet)) {
      throw new AppError('شواهد استخراج‌شده نامعتبر است.', 400);
    }
    sanitized.push(
      EvidenceItemSchema.parse({
        ...item,
        chunk_id: chunk.chunk_id,
        content,
        snippet
      })
    );
  }
  return sanitized;
}

function deriveSnippet(text: string, content: string) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const cleanContent = content.replace(/\s+/g, ' ').trim();
  if (!cleanText) return '';
  if (!cleanContent) return cleanText.slice(0, 160);
  const idx = cleanText.indexOf(cleanContent);
  if (idx === -1) return cleanText.slice(0, 160);
  const start = Math.max(0, idx - 60);
  return cleanText.slice(start, start + 160);
}

function deriveContent(text: string, content: string) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const cleanContent = content.replace(/\s+/g, ' ').trim();
  if (!cleanText) return '';
  if (cleanContent && cleanText.includes(cleanContent)) return cleanContent.slice(0, 200);
  return cleanText.slice(0, 200);
}

function containsPdfInternals(text: string) {
  return /%PDF|xref|endobj|obj\s*<</i.test(text);
}
