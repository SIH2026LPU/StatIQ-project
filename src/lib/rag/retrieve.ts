import { db } from "@/db/store";

export function retrieveChunks(query: string, limit = 4) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 3);

  return db
    .listChunks()
    .map((chunk) => {
      const text = chunk.text.toLowerCase();
      const hits = terms.reduce(
        (sum, term) => sum + (text.includes(term) ? 1 : 0),
        0,
      );
      return { chunk, hits };
    })
    .filter((item) => item.hits > 0 || terms.length === 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit)
    .map((item) => item.chunk);
}

export function answerFromChunks(question: string) {
  const chunks = retrieveChunks(question);
  const documents = db.listDocuments();

  if (chunks.length === 0) {
    return {
      answer:
        "I do not have enough indexed source material to answer that. Upload or index an approved document, or rephrase using a course topic such as SQL, sampling, or survey weights.",
      sources: [],
      grounded: false,
    };
  }

  const sourceLines = chunks.map((chunk) => {
    const doc = documents.find((item) => item.id === chunk.documentId);
    return {
      documentId: chunk.documentId,
      title: doc?.title ?? chunk.documentId,
      excerpt: chunk.text,
    };
  });

  const answer = `Based on approved learning materials (not model recollection):\n\n${chunks
    .map((chunk, index) => `${index + 1}. ${chunk.text}`)
    .join("\n\n")}\n\nIf this does not match the source, treat the document as authoritative.`;

  return { answer, sources: sourceLines, grounded: true };
}
