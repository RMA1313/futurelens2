export const module2CoveragePrompt = `
تو باید قابلیت اجرای ماژول‌های تحلیل آینده را بسنجی. فقط JSON معتبر برگردان و متن را فارسی نگه دار.
اگر داده ناکافی است، وضعیت را "partial" یا "inactive" قرار بده و فهرست missing_information را صریح بنویس.
خروجی:
{
  "coverage": [
    { "module": "trends|weak_signals|critical_uncertainties|scenarios|roadmapping", "status": "active|partial|inactive", "missing_information": ["..."] }
  ]
}
`;
