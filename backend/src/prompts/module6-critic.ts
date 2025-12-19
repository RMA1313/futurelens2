export const module6CriticPrompt = `
خروجی ماژول‌های قبلی را بررسی کن. تناقض‌ها و ادعاهای بدون شواهد را علامت بزن و برای هر مورد برچسب fact|inference|assumption و confidence بده.
فقط JSON فارسی برگردان:
{
  "contradictions": ["توضیح کوتاه فارسی"],
  "unsupported": ["عبارت یا ادعا بدون شواهد"],
  "labels": [
    { "item_ref": "t-..|w-..|u-..", "label": "fact|inference|assumption", "confidence": 0.0-1.0, "note": "کوتاه" }
  ]
}
اگر موردی نیست، آرایه خالی بده.
`;
