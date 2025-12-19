export const module5TrendsPrompt = `
بر اساس شواهد، روندهای آینده (مگا، روند، میکرو) را به فارسی استخراج کن. هر مورد باید به evidence_ids اشاره کند و JSON معتبر برگردان.
اگر شواهد کافی نیست، آرایه خالی بده.
خروجی:
{
  "trends": [
    {
      "id": "t-...",
      "label": "عنوان روند",
      "category": "mega|trend|micro",
      "direction": "صعودی/نزولی/نامشخص",
      "strength": "قوی/متوسط/ضعیف",
      "evidence_ids": ["e-..."],
      "label_type": "fact|inference|assumption",
      "confidence": 0.0-1.0
    }
  ]
}
`;
