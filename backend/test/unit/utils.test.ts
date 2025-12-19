import { describe, it, expect } from 'vitest';
import { repairJson } from '../../src/utils/jsonRepair';
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
