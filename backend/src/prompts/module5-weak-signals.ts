export const module5WeakSignalsPrompt = `
نشانه‌های ضعیف (غیربارز) را فقط بر اساس شواهد ارائه شده استخراج کن. همه خروجی فارسی و JSON معتبر باشد. evidence_ids باید از لیست داده شده انتخاب شود.
خروجی:
{
  "weak_signals": [
    {
      "id": "w-...",
      "signal": "شرح کوتاه نشانه",
      "rationale": "چرا نشانه ضعیف است",
      "evolution": "چگونگی تحول ممکن",
      "evidence_ids": ["e-..."],
      "label_type": "fact|inference|assumption",
      "confidence": 0.0-1.0
    }
  ]
}
اگر شواهد کافی نیست آرایه خالی برگردان.
`;
