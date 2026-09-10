import { db } from "@/db";
import { documentChunks, documentEmbeddings, documents } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { chunkText } from "./chunk";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
const EMBEDDING_API_KEY = process.env.OPENAI_API_KEY || process.env.EMBEDDING_API_KEY;

/**
 * Calls the configured embedding provider. Written against the OpenAI-compatible
 * embeddings shape (used by most providers, including Voyage/OpenAI); swap the
 * fetch target if your AI_API_KEY provider uses a different endpoint.
 */
export async function embedText(text: string): Promise<number[]> {
  if (!EMBEDDING_API_KEY || EMBEDDING_API_KEY.startsWith("gsk_")) {
    throw new Error("RAG_UNAVAILABLE: Valid EMBEDDING_API_KEY or OPENAI_API_KEY is not set.");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EMBEDDING_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Embedding request failed: HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data[0].embedding as number[];
}

/** Ingests one document's extracted text: chunk -> embed -> store, end to end. */
export async function indexDocument(documentId: string, extractedText: string) {
  await db.update(documents).set({ status: "PROCESSING" }).where(eq(documents.id, documentId));

  try {
    const chunks = chunkText(extractedText);

    for (const chunk of chunks) {
      const [row] = await db
        .insert(documentChunks)
        .values({
          documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenEstimate,
        })
        .returning();

      const embedding = await embedText(chunk.content);

      await db.insert(documentEmbeddings).values({
        chunkId: row.id,
        embedding,
        embeddingModel: EMBEDDING_MODEL,
      });
    }

    await db.update(documents).set({ status: "INDEXED" }).where(eq(documents.id, documentId));
    return { chunksIndexed: chunks.length };
  } catch (err) {
    await db
      .update(documents)
      .set({ status: "FAILED", processingError: (err as Error).message })
      .where(eq(documents.id, documentId));
    throw err;
  }
}

/**
 * Cosine-similarity nearest-neighbour search over indexed chunks using pgvector's
 * `<=>` operator. Requires the ivfflat index described in BACKEND_ARCHITECTURE.md.
 */
export async function searchSimilarChunks(queryText: string, opts: { limit?: number; organizationId?: string } = {}) {
  const { limit = 6 } = opts;
  const queryEmbedding = await embedText(queryText);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  return db.execute(sql`
    SELECT dc.id, dc.document_id, dc.content, dc.page_number, dc.section,
           (de.embedding <=> ${vectorLiteral}::vector) AS distance
    FROM document_embeddings de
    JOIN document_chunks dc ON dc.id = de.chunk_id
    JOIN documents d ON d.id = dc.document_id
    WHERE d.status = 'INDEXED'
    ORDER BY de.embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `);
}
