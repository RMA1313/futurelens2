import { createHash } from 'crypto';
import { Chunk } from '../schemas/common';

export function normalizePersianText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashText(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 8);
}

export function chunkText(text: string, maxLen = 800): Chunk[] {
  const normalized = normalizePersianText(text);
  const chunks: Chunk[] = [];
  let pointer = 0;
  let idx = 1;
  while (pointer < normalized.length) {
    const slice = normalized.slice(pointer, pointer + maxLen).trim();
    chunks.push({
      chunk_id: `c${idx}-${hashText(slice)}`,
      text: slice
    });
    pointer += maxLen;
    idx += 1;
  }
  return chunks;
}
