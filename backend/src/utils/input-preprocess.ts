const URL_PATTERN = /(?:https?:\/\/|www\.)\S+/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;
const REPEATED_CHAR_PATTERN = /(\p{L}|\p{N})\1{2,}/gu;

/**
 * Clean and normalize user-provided text to reduce noise before downstream LLM stages.
 * The function is deterministic, side-effect free, and gracefully handles empty input.
 */
export function inputPreprocess(text?: string | null): string {
  if (!text) return '';

  let working = text;
  working = working.replace(HTML_TAG_PATTERN, ' ');
  working = working.replace(URL_PATTERN, ' ');
  working = working.replace(EMOJI_PATTERN, ' ');
  working = working.replace(/[\u200C\u200D]/g, ' ');
  working = working.replace(/ي/g, 'ی').replace(/ك/g, 'ک');

  const tokens = working
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => {
      const firstChar = token[0];
      return firstChar !== '#' && firstChar !== '@';
    });

  working = tokens.join(' ');
  working = working.replace(REPEATED_CHAR_PATTERN, '$1');
  working = working.replace(/\s+/g, ' ').trim();

  return working;
}
