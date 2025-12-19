export const module3ClarificationsPrompt = `
با توجه به پوشش فعلی ماژول‌ها، برای موارد partial یا inactive سوالات روشن‌ساز کوتاه و دقیق (فارسی) تولید کن.
فقط JSON برگردان:
{
  "questions": [
    { "id": "q-...", "module": "نام ماژول", "question": "سوال کوتاه برای کاربر" }
  ]
}
اگر ماژولی نیاز به سوال ندارد آرایه خالی باشد.
`;
