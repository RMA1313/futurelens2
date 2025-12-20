import { describe, it, expect } from 'vitest';
import { repairJson } from '../../src/utils/jsonRepair';
import { inputPreprocess } from '../../src/utils/input-preprocess';
import { CoverageEntrySchema, DocumentClassifierSchema } from '../../src/schemas/modules';

describe('json repair', () => {
  it('repairs minor JSON formatting issues', () => {
    const broken = '{ "a": 1, }';
    const repaired = repairJson(broken);
    const parsed = JSON.parse(repaired);
    expect(parsed.a).toBe(1);
  });
});

describe('schema validation', () => {
  it('accepts valid classifier', () => {
    const data = {
      document_type: 'گزارش سیاستی',
      domain: 'هوش مصنوعی',
      horizon: 'کوتاه‌مدت',
      analytical_level: 'تحلیلی'
    };
    expect(() => DocumentClassifierSchema.parse(data)).not.toThrow();
  });

  it('rejects invalid coverage status', () => {
    expect(() =>
      CoverageEntrySchema.parse({
        module: 'trends',
        status: 'unknown',
        missing_information: []
      })
    ).toThrow();
  });
});

describe('input preprocessing', () => {
  it('filters hashtags and mentions', () => {
    const cleaned = inputPreprocess('سلام #آینده @کاربر');
    expect(cleaned).toBe('سلام');
  });

  it('drops URLs before downstream stages', () => {
    const cleaned = inputPreprocess('ببین https://example.com اینجا');
    expect(cleaned).toBe('ببین اینجا');
  });

  it('strips emojis and symbol noise', () => {
    const cleaned = inputPreprocess('سلام 😊 دنیا');
    expect(cleaned).toBe('سلام دنیا');
  });

  it('normalizes Persian characters and joiners', () => {
    const cleaned = inputPreprocess('ي\u200Cك و ك');
    expect(cleaned).toBe('ی ک و ک');
  });

  it('collapses excessive character repetition', () => {
    const cleaned = inputPreprocess('عاااالی');
    expect(cleaned).toBe('عالی');
  });

  it('returns empty string for empty input', () => {
    expect(inputPreprocess(undefined)).toBe('');
  });
});
