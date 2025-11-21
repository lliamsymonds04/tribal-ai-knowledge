import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for a given text using OpenAI's text-embedding-ada-002 model
 * @param text The text to generate embeddings for
 * @returns Array of numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts Array of texts to generate embeddings for
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // OpenAI allows up to 2048 texts per batch
    const BATCH_SIZE = 2048;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch.map(text => text.trim()),
      });

      embeddings.push(...response.data.map(d => d.embedding));
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Split text into chunks for embedding
 * Useful for long documents that exceed token limits
 * @param text The text to split
 * @param maxTokens Maximum tokens per chunk (default: 8000, ada-002 limit is 8191)
 * @returns Array of text chunks
 */
export function splitTextIntoChunks(
  text: string,
  maxTokens: number = 8000
): string[] {
  // Rough estimation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If a single paragraph is too long, split it by sentences
    if (paragraph.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentences = paragraph.split(/[.!?]+\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChars) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? '. ' : '') + sentence;
        }
      }
    } else if (currentChunk.length + paragraph.length > maxChars) {
      // If adding this paragraph exceeds the limit, save current chunk
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Calculate cosine similarity between two embeddings
 * @param a First embedding vector
 * @param b Second embedding vector
 * @returns Similarity score between -1 and 1 (higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
