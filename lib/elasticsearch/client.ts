import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_API_KEY
    ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
    : undefined,
});

// Create index
export async function createIndex(indexName: string, mapping?: any) {
  const exists = await client.indices.exists({ index: indexName });

  if (!exists) {
    await client.indices.create({
      index: indexName,
      body: mapping ? { mappings: mapping } : undefined,
    });
  }
}

// Index document
export async function indexDocument(
  indexName: string,
  id: string,
  document: any
) {
  return await client.index({
    index: indexName,
    id,
    document,
  });
}

// Search documents
export async function searchDocuments(
  indexName: string,
  query: any,
  options?: any
) {
  return await client.search({
    index: indexName,
    body: {
      query,
      ...options,
    },
  });
}

// Get document
export async function getDocument(indexName: string, id: string) {
  return await client.get({
    index: indexName,
    id,
  });
}

// Update document
export async function updateDocument(
  indexName: string,
  id: string,
  updates: any
) {
  return await client.update({
    index: indexName,
    id,
    body: { doc: updates },
  });
}

// Delete document
export async function deleteDocument(indexName: string, id: string) {
  return await client.delete({
    index: indexName,
    id,
  });
}

// Bulk index
export async function bulkIndex(indexName: string, documents: Array<{ id: string; doc: any }>) {
  const body = documents.flatMap((doc) => [
    { index: { _index: indexName, _id: doc.id } },
    doc.doc,
  ]);

  return await client.bulk({ body });
}

// Aggregation query
export async function aggregate(indexName: string, aggregation: any) {
  return await client.search({
    index: indexName,
    body: {
      size: 0,
      aggs: aggregation,
    },
  });
}

export { client };
