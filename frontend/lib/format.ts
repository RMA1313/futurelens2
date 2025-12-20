const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string) {
  return input.replace(/\d/g, (d) => persianDigits[Number(d)] ?? d);
}

export function formatNumber(value?: number, fractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'نامشخص';
  const fixed = value.toFixed(fractionDigits);
  return toPersianDigits(fixed);
}

export function formatPercent(value?: number) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'نامشخص';
  const rounded = Math.round(value);
  return `${toPersianDigits(String(rounded))}%`;
}

export function formatDateTime(value?: string | Date) {
  if (!value) return 'نامشخص';
  if (value instanceof Date) {
    return toPersianDigits(value.toLocaleString('fa-IR'));
  }
  return toPersianDigits(value);
}

export function formatId(value?: string) {
  if (!value) return 'نامشخص';
  return toPersianDigits(value);
}
