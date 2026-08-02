import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Initialize index
export async function getIndex(indexName: string = 'default') {
  return pinecone.index(indexName);
}

// Upsert vectors
export async function upsertVectors(
  indexName: string,
  vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>
) {
  const index = await getIndex(indexName);
  await index.upsert(vectors);
}

// Query vectors
export async function queryVectors(
  indexName: string,
  vector: number[],
  topK: number = 10,
  filter?: Record<string, any>
) {
  type QueryOptions = {
    vector: number[];
    topK: number;
    includeMetadata?: boolean;
    filter?: Record<string, any>;
  };

  const options: QueryOptions = {
    vector,
    topK,
    includeMetadata: true,
  };

  if (filter) {
    options.filter = filter;
  }

  const index = await getIndex(indexName);
  const results = await index.query(options);

  return results.matches;
}

// Delete vectors
export async function deleteVectors(indexName: string, ids: string[]) {
  const index = await getIndex(indexName);
  await index.deleteMany(ids);
}

// Get vector by ID
export async function getVector(indexName: string, id: string) {
  const index = await getIndex(indexName);
  const result = await index.fetch([id]);

  return result.records[0];
}

// List all vectors
export async function listVectors(indexName: string, limit: number = 100) {
  const index = await getIndex(indexName);
  const result = await index.listPaginated({ limit });

  return result.vectors;
}

// Create index
export async function createIndex(name: string, dimension: number) {
  await pinecone.createIndex({
    name,
    dimension,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });
}

// Delete index
export async function deleteIndex(name: string) {
  await pinecone.deleteIndex(name);
}

export { pinecone };
