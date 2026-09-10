import { ChromaClient } from "chromadb";
import { generateGeminiContent } from "./gemini-client";

export interface RetrievedDocument {
  id: string;
  title: string;
  source: string;
  content: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface RagResponse {
  answer: string;
  sources: Array<{
    name: string;
    type: string;
    excerpt: string;
    collection?: string;
  }>;
}

const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || "StatlQAi123";
const CHROMA_SOURCE_URL = process.env.CHROMA_SOURCE_URL || "https://www.trychroma.com/harshbh20102/aws-us-east-1/StatlQAi123/source";

// Official MoSPI & Indian Statistical System Grounded Knowledge Bank for RAG
const OFFICIAL_MOSPI_CORPUS: RetrievedDocument[] = [
  {
    id: "mospi-wpi-methodology",
    title: "Wholesale Price Index (WPI) Compilation Manual",
    source: "Office of the Economic Adviser, Ministry of Commerce & Industry / MoSPI",
    content: `Wholesale Price Index (WPI) in India uses the base year 2011-12 with 697 items (earlier 680 commodities). It is compiled using the Laspeyres index formula:
WPI_t = [ (sum p_{i,t} * w_{i,0}) / (sum p_{i,0} * w_{i,0}) ] * 100.
The major groups are:
1. Primary Articles (weight 22.62%, 117 items)
2. Fuel & Power (weight 13.15%, 16 items)
3. Manufactured Products (weight 64.23%, 564 items).
Prices are collected weekly/monthly at factory-gate/wholesale markets.`
  },
  {
    id: "mospi-cpi-methodology",
    title: "Consumer Price Index (CPI) Combined Manual",
    source: "National Statistical Office (NSO), MoSPI",
    content: `Consumer Price Index (CPI) with base year 2012=100 measures changes over time in the general level of prices of goods and services that a reference population acquires for consumption.
The CPI is compiled separately for Rural, Urban, and Combined (All India).
Groups include Food and Beverages (45.86% weight in Combined), Pan, tobacco and intoxicants, Clothing and footwear, Housing (Urban only), Fuel and light, and Miscellaneous.`
  },
  {
    id: "mospi-plfs-sampling",
    title: "Periodic Labour Force Survey (PLFS) Sampling Design",
    source: "Survey Design and Research Division (SDRD), NSO",
    content: `PLFS uses a stratified multi-stage sampling design. In rural areas, the First Stage Units (FSUs) are 2011 Census villages. In urban areas, FSUs are Urban Frame Survey (UFS) blocks.
The Ultimate Stage Units (USUs) are households.
Multipliers (sampling weights) are applied to estimate population totals from sample counts:
Estimated Total Y = sum (y_{i} * Multiplier_{i}).
Key metrics: Labour Force Participation Rate (LFPR), Worker Population Ratio (WPR), and Unemployment Rate (UR).`
  },
  {
    id: "mospi-nas-gdp",
    title: "National Accounts Statistics (NAS) System of National Accounts",
    source: "National Accounts Division (NAD), NSO",
    content: `National Accounts Statistics follow UN SNA 2008 standards with base year 2011-12.
Gross Value Added (GVA) at basic prices = GVA at factor cost + (Production taxes - Production subsidies).
GDP at market prices = GVA at basic prices + (Product taxes - Product subsidies).
Three approaches for compilation: Production Approach, Expenditure Approach, and Income Approach.`
  },
  {
    id: "mospi-asi-microdata",
    title: "Annual Survey of Industries (ASI) Microdata & Schedule",
    source: "Industrial Statistics Wing, MoSPI",
    content: `Annual Survey of Industries (ASI) covers registered manufacturing units under Sections 2m(i) and 2m(ii) of Factories Act, 1948 and Bidi & Cigar Workers Act.
Sampling is bifurcated into Census Sector (100% enumerated large units) and Sample Sector.
Key variables: Invested Capital, Gross Output, Net Value Added (NVA), Total Employment, Wages, and Depreciation.`
  },
  {
    id: "mospi-sdc-governance",
    title: "Statistical Disclosure Control (SDC) & Microdata Anonymization",
    source: "Computer Centre / Microdata Access Lab, MoSPI",
    content: `SDC principles mandate that published microdata datasets ensure zero re-identification of surveyed entities.
Measures include: k-anonymity (k>=3), top/bottom coding of sensitive variables (e.g., income, turnover), suppression of direct identifiers (household head name, exact geo-coordinates, establishment names), and micro-aggregation.`
  },
  {
    id: "mospi-esankhyiki-api",
    title: "eSankhyiki Data Platform & MoSPI National Data Warehouse",
    source: "Data Informatics and Innovation Division (DIID), MoSPI",
    content: `eSankhyiki is the official unified data portal of MoSPI offering four modules:
1. Macro Indicators (API / time-series data for CPI, IIP, NAS)
2. Microdata Portal (NADA archive with questionnaire schedules)
3. Data Visualisation Engine
4. API Gateway with token-based authentication and zero-trust credential proxying.`
  }
];

let chromaClient: ChromaClient | null = null;

export function getChromaClient(): ChromaClient {
  if (!chromaClient) {
    try {
      chromaClient = new ChromaClient();
    } catch (e) {
      console.warn("[chroma-rag] Initializing fallback Chroma client");
      chromaClient = new ChromaClient();
    }
  }
  return chromaClient;
}

/**
 * Retrieve relevant documents from ChromaDB collection or official MoSPI knowledge bank
 */
export async function retrieveChromaDocuments(query: string, topK: number = 3): Promise<RetrievedDocument[]> {
  try {
    const client = getChromaClient();
    const collection = await client.getOrCreateCollection({
      name: CHROMA_COLLECTION,
      metadata: { "description": "StatIQ AI MoSPI Statistical Knowledgebase" },
    });

    // Check count and ingest base corpus if empty
    const count = await collection.count();
    if (count === 0) {
      await collection.add({
        ids: OFFICIAL_MOSPI_CORPUS.map((d) => d.id),
        documents: OFFICIAL_MOSPI_CORPUS.map((d) => `${d.title}\n${d.source}\n${d.content}`),
        metadatas: OFFICIAL_MOSPI_CORPUS.map((d) => ({
          title: d.title,
          source: d.source,
          url: CHROMA_SOURCE_URL,
        })),
      });
    }

    const results = await collection.query({
      queryTexts: [query],
      nResults: topK,
    });

    if (results.documents && results.documents[0] && results.documents[0].length > 0) {
      const retrieved: RetrievedDocument[] = [];
      const docs = results.documents[0];
      const ids = results.ids[0];
      const metas = results.metadatas ? results.metadatas[0] : [];

      for (let i = 0; i < docs.length; i++) {
        const meta = metas[i] as Record<string, any> || {};
        retrieved.push({
          id: ids[i] || `doc-${i}`,
          title: meta.title || "Official Statistical Manual",
          source: meta.source || "MoSPI National Statistical Office",
          content: docs[i] || "",
          metadata: meta,
        });
      }
      return retrieved;
    }
  } catch (error) {
    console.warn("[chroma-rag] ChromaDB query notice, using structured semantic fallback:", error);
  }

  // Fallback: Ranked keyword matching across official corpus
  const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = OFFICIAL_MOSPI_CORPUS.map((doc) => {
    let score = 0;
    const text = `${doc.title} ${doc.source} ${doc.content}`.toLowerCase();
    for (const token of qTokens) {
      if (text.includes(token)) score += 1;
    }
    return { ...doc, score };
  });

  scored.sort((a, b) => (b.score || 0) - (a.score || 0));
  return scored.slice(0, topK);
}

/**
 * Execute RAG (Chroma Retrieval + Google Gemini Generation)
 */
export async function generateRagTutorResponse(query: string): Promise<RagResponse> {
  const retrievedDocs = await retrieveChromaDocuments(query, 3);

  const contextText = retrievedDocs
    .map((d, i) => `[Document ${i + 1}] Source: ${d.source} | Title: ${d.title}\n${d.content}`)
    .join("\n\n");

  const systemInstruction = `You are the StatIQ National Statistical AI Tutor for India's Official Statistical System (MoSPI, NSSO, CSO, ISS, eSankhyiki).
You guide statistical officers, researchers, and learners using verified official methodologies, price index formulations, national accounts, and sampling designs.

CRITICAL INSTRUCTIONS:
1. Ground your response firmly in the provided verified ChromaDB statistical context.
2. When presenting mathematical formulas (e.g., Laspeyres WPI, Paasche, CPI weights, PLFS multipliers), ALWAYS use clean LaTeX notation with display math \\[ ... \\] for main equations and inline math \\( ... \\) for variables.
3. Use markdown formatting with clean headings (##, ###), bullet points, and markdown tables (| Category | ... |) where applicable.
4. Always maintain high academic and statistical rigor. Never fabricate non-existent formulas or official data.`;

  const prompt = `VERIFIED CHROMADB STATISTICAL CONTEXT:
${contextText}

LEARNER QUERY:
${query}

Please provide a detailed, well-structured, mathematical explanation with official MoSPI context and formulas.`;

  try {
    const answer = await generateGeminiContent(prompt, systemInstruction, "gemini-3.6-flash");

    const sources = retrievedDocs.map((d) => ({
      name: d.title,
      type: "official",
      excerpt: d.source,
      collection: CHROMA_COLLECTION,
    }));

    return { answer, sources };
  } catch (error) {
    console.error("[chroma-rag] Gemini generation failed, using structured fallback:", error);
    throw error;
  }
}
