/**
 * parsePDF.ts
 *
 * Server-side PDF text extraction using pdf-parse.
 * Uses dynamic import to prevent webpack from trying to bundle
 * pdf-parse during the client build.
 *
 * IMPORTANT: Only call this from API routes (Node.js runtime).
 */

type PdfParseResult = { text: string; numpages: number; numrender: number };
type PdfParseFunction = (buffer: Buffer) => Promise<PdfParseResult>;

/**
 * Extracts raw text from a PDF buffer.
 * @param buffer - PDF file contents as a Node.js Buffer
 * @returns Plain text extracted from the PDF
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import — pdf-parse may export as default or as the module itself
        // depending on the bundler/version, so we handle both.
        const imported = await import("pdf-parse");
        const pdfParse: PdfParseFunction =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (imported as any).default ?? (imported as unknown as PdfParseFunction);

        const data = await pdfParse(buffer);

        if (!data.text || data.text.trim().length === 0) {
            throw new Error(
                "PDF appears to have no extractable text. It may be a scanned image PDF."
            );
        }

        return data.text;
    } catch (err) {
        if (err instanceof Error && err.message.includes("no extractable text")) {
            throw err;
        }
        throw new Error(
            "Could not read the PDF. Please try exporting your statement as CSV instead."
        );
    }
}
