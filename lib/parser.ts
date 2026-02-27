/**
 * lib/parser.ts
 * Extract plain text from PDF and DOCX resume files.
 * PDF  → pdf-parse (inner lib path to avoid test-PDF loading issues in Next.js)
 * DOCX → mammoth
 */

/**
 * Extract text from a PDF buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    // Use the inner lib path to avoid pdf-parse's test-read on import
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (
        buf: Buffer,
        opts?: Record<string, unknown>
    ) => Promise<{ text: string; numpages: number }>;

    const result = await pdfParse(buffer);
    return result.text.trim();
}

/**
 * Extract text from a DOCX buffer using mammoth.
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
    };

    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
}

/**
 * Auto-detect format by MIME type / extension and extract text.
 * Supported types: application/pdf | application/vnd.openxmlformats…
 */
export async function extractResumeText(
    buffer: Buffer,
    mimeType: string,
    filename: string
): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

    if (
        mimeType === 'application/pdf' ||
        ext === 'pdf'
    ) {
        return extractTextFromPDF(buffer);
    }

    if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === 'docx'
    ) {
        return extractTextFromDOCX(buffer);
    }

    throw new Error(`Unsupported file type: ${mimeType || ext}. Please upload PDF or DOCX.`);
}
