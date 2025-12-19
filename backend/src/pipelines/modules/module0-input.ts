import { chunkText, normalizePersianText } from '../../utils/chunking';
import { Chunk } from '../../schemas/common';

export type Module0Result = {
  cleanedText: string;
  chunks: Chunk[];
};

export function runModule0(rawText: string): Module0Result {
  const cleanedText = normalizePersianText(rawText);
  const chunks = chunkText(cleanedText, 800);
  return { cleanedText, chunks };
}
