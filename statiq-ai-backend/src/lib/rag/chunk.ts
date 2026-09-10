export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenEstimate: number;
}

/**
 * Simple, dependency-free sliding-window chunker. Good enough for MVP RAG;
 * swap for a structure-aware chunker (headings/slides/pages) once real
 * training-material PDFs/PPTs are wired through the document-parsing step.
 */
export function chunkText(
  text: string,
  opts: { chunkSize?: number; overlap?: number } = {}
): TextChunk[] {
  const { chunkSize = 1200, overlap = 200 } = opts;
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!clean) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const content = clean.slice(start, end).trim();
    if (content) {
      chunks.push({
        chunkIndex: index,
        content,
        tokenEstimate: Math.ceil(content.length / 4),
      });
      index += 1;
    }
    if (end >= clean.length) break;
    start = end - overlap;
  }

  return chunks;
}
