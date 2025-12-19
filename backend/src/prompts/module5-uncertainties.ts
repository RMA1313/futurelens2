export const module5UncertaintiesPrompt = `
عدم‌قطعیت‌های بحرانی با اثر بالا و عدم‌قطعیت زیاد را استخراج کن. فقط از شواهد داده‌شده استفاده کن و JSON معتبر بازگردان. evidence_ids باید به اقلام موجود اشاره کند.
خروجی:
{
  "critical_uncertainties": [
    {
      "id": "u-...",
      "driver": "محرک/عامل",
      "impact": "اثر بالقوه",
      "uncertainty_reason": "دلیل عدم قطعیت",
      "evidence_ids": ["e-..."],
      "label_type": "fact|inference|assumption",
      "confidence": 0.0-1.0
    }
  ]
}
اگر شواهد ناکافی است آرایه خالی بده.
`;
