import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from './errors';
import { logger } from '../logger';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const TEXT_MIN_LENGTH = 40;
const OCR_TEXT_MIN_LENGTH = 120;
const MIN_TEXT_LENGTH = 10;
const execFileAsync = promisify(execFile);

export type ExtractionMeta = {
  extracted_chars: number;
  extractor_used: 'pdf-parse' | 'ocr' | 'docx' | 'plain-text' | 'fallback-text';
  pages_detected: number;
  is_scanned_heuristic: boolean;
  file_name?: string;
};

function isPdfFile(buffer: Buffer, fileName?: string) {
  if (fileName?.toLowerCase().endsWith('.pdf')) return true;
  const header = buffer.subarray(0, 5).toString('utf-8');
  return header.startsWith('%PDF-');
}

function isDocxFile(fileName?: string) {
  return !!fileName && fileName.toLowerCase().endsWith('.docx');
}

function isTxtFile(fileName?: string) {
  return !!fileName && fileName.toLowerCase().endsWith('.txt');
}

function isLegacyDoc(fileName?: string) {
  return !!fileName && fileName.toLowerCase().endsWith('.doc');
}

function assertTextUsable(text: string, context: string, minLength = TEXT_MIN_LENGTH) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length < minLength) {
    throw new AppError(`متن قابل استفاده برای ${context} به اندازه کافی پیدا نشد.`, 400);
  }
  return cleaned;
}

function looksLikeBinary(text: string) {
  const sample = text.slice(0, 500);
  let nonPrintable = 0;
  for (const ch of sample) {
    const code = ch.charCodeAt(0);
    if (code === 65533 || (code < 9 || (code > 13 && code < 32))) {
      nonPrintable += 1;
    }
  }
  return nonPrintable / Math.max(sample.length, 1) > 0.1;
}

function hasPdfInternals(text: string) {
  return /%PDF|xref|endobj|obj\s*<</i.test(text);
}

function uniqueWordCount(text: string) {
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return new Set(words.map((w) => w.toLowerCase())).size;
}

function isScannedHeuristic(text: string, pagesDetected: number) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const unique = uniqueWordCount(cleaned);
  const perPage = pagesDetected > 0 ? cleaned.length / pagesDetected : cleaned.length;
  return cleaned.length < 300 || unique < 30 || perPage < 80;
}

async function isCommandAvailable(cmd: string) {
  try {
    const probe = process.platform === 'win32' ? 'where' : 'which';
    await execFileAsync(probe, [cmd]);
    return true;
  } catch {
    return false;
  }
}

async function runOcrOnPdf(
  pdfBuffer: Buffer,
  pagesDetected: number,
  fileName?: string
): Promise<{ text: string; meta: ExtractionMeta }> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'futurelenz-ocr-'));
  const pdfPath = path.join(tempDir, 'input.pdf');
  const prefix = path.join(tempDir, 'page');
  await fs.writeFile(pdfPath, pdfBuffer);

  try {
    await execFileAsync('pdftoppm', ['-png', pdfPath, prefix], { timeout: 120000 });
    const files = (await fs.readdir(tempDir))
      .filter((name) => name.startsWith('page-') && name.endsWith('.png'))
      .map((name) => path.join(tempDir, name))
      .sort();

    if (!files.length) {
      throw new AppError('هیچ صفحه‌ای برای OCR تولید نشد.', 400);
    }

    const chunks: string[] = [];
    for (const file of files) {
      const { stdout } = await execFileAsync('tesseract', [file, 'stdout', '-l', 'fas+eng'], {
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024
      });
      chunks.push(stdout);
    }
    const text = chunks.join('\n');
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length < OCR_TEXT_MIN_LENGTH) {
      throw new AppError('متن OCR به اندازه کافی طولانی نیست.', 400);
    }
    const meta: ExtractionMeta = {
      extracted_chars: cleaned.length,
      extractor_used: 'ocr',
      pages_detected: pagesDetected,
      is_scanned_heuristic: true,
      file_name: fileName
    };
    logger.info(meta, 'OCR extraction completed');
    return { text: cleaned, meta };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileName?: string
): Promise<{ text: string; meta: ExtractionMeta }> {
  if (isPdfFile(buffer, fileName)) {
    let parser: PDFParse | undefined;
    try {
      parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      const rawText = data.text || '';
      const pagesDetected = data.total || data.pages?.length || 0;
      const cleaned = rawText.replace(/\s+/g, ' ').trim();
      if (hasPdfInternals(cleaned)) {
        throw new AppError('متن استخراج‌شده شامل ساختار داخلی PDF است.', 400);
      }
      const unique = uniqueWordCount(cleaned);
      const scanned = isScannedHeuristic(cleaned, pagesDetected);
      const smallDocOverride =
        cleaned.length >= MIN_TEXT_LENGTH && pagesDetected <= 1 && unique >= 2;
      const meta: ExtractionMeta = {
        extracted_chars: cleaned.length,
        extractor_used: 'pdf-parse',
        pages_detected: pagesDetected,
        is_scanned_heuristic: scanned && !smallDocOverride,
        file_name: fileName
      };
      logger.info(meta, 'PDF text extracted');

      if (cleaned.length >= TEXT_MIN_LENGTH || smallDocOverride) {
        return { text: cleaned, meta };
      }

      const hasOcr = (await isCommandAvailable('pdftoppm')) && (await isCommandAvailable('tesseract'));
      if (!hasOcr) {
        throw new AppError(
          'متن استخراج‌شده برای این فایل کافی نیست و ابزار OCR در دسترس نیست. لطفا نسخه متنی یا PDF قابل جستجو ارسال کنید.',
          400
        );
      }
      return await runOcrOnPdf(buffer, pagesDetected, fileName);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('استخراج متن از فایل پی‌دی‌اف ناموفق بود.', 400);
    } finally {
      if (parser) {
        await parser.destroy();
      }
    }
  }

  if (isDocxFile(fileName)) {
    try {
      const data = await mammoth.extractRawText({ buffer });
      const cleaned = assertTextUsable(data.value || '', 'سند داکس', MIN_TEXT_LENGTH);
      const meta: ExtractionMeta = {
        extracted_chars: cleaned.length,
        extractor_used: 'docx',
        pages_detected: 0,
        is_scanned_heuristic: false,
        file_name: fileName
      };
      logger.info(meta, 'DOCX text extracted');
      return { text: cleaned, meta };
    } catch (err) {
      throw new AppError('استخراج متن از فایل داکس ناموفق بود.', 400);
    }
  }

  if (isLegacyDoc(fileName)) {
    throw new AppError('فرمت .doc قدیمی پشتیبانی نمی‌شود. لطفا فایل .docx ارسال کنید.', 400);
  }

  if (isTxtFile(fileName) || fileName) {
    const text = buffer.toString('utf-8');
    if (looksLikeBinary(text)) {
      throw new AppError('این فایل متنی به نظر باینری است و قابل خواندن نیست.', 400);
    }
    const cleaned = assertTextUsable(text, 'فایل متنی', MIN_TEXT_LENGTH);
    const meta: ExtractionMeta = {
      extracted_chars: cleaned.length,
      extractor_used: 'plain-text',
      pages_detected: 0,
      is_scanned_heuristic: false,
      file_name: fileName
    };
    logger.info(meta, 'Plain text extracted');
    return { text: cleaned, meta };
  }

  const fallbackText = buffer.toString('utf-8');
  if (looksLikeBinary(fallbackText)) {
    throw new AppError('نوع فایل پشتیبانی نمی‌شود.', 400);
  }
  const cleaned = assertTextUsable(fallbackText, 'فایل', MIN_TEXT_LENGTH);
  const meta: ExtractionMeta = {
    extracted_chars: cleaned.length,
    extractor_used: 'fallback-text',
    pages_detected: 0,
    is_scanned_heuristic: false,
    file_name: fileName
  };
  logger.info(meta, 'Fallback text extracted');
  return { text: cleaned, meta };
}
