import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

// Generate text
export async function generateText(prompt: string, model: string = 'command') {
  const response = await cohere.generate({
    model,
    prompt,
    maxTokens: 1024,
  });

  return response.generations[0].text;
}

// Stream text
export async function* streamText(prompt: string, model: string = 'command') {
  const stream = await cohere.generateStream({
    model,
    prompt,
    maxTokens: 1024,
  });

  for await (const event of stream) {
    if (event.type === 'text-generation') {
      yield event.text;
    }
  }
}

// Embed text
export async function embedText(texts: string[], model: string = 'embed-english-v3.0') {
  const response = await cohere.embed({
    texts,
    model,
    inputType: 'search_document',
  });

  return response.embeddings;
}

// Rerank documents
export async function rerank(query: string, documents: string[], topN: number = 5) {
  const response = await cohere.rerank({
    query,
    documents,
    topN,
    model: 'rerank-english-v3.0',
  });

  return response.results;
}

// Classify text
export async function classifyText(inputs: string[], examples: any[]) {
  const response = await cohere.classify({
    inputs,
    examples,
  });

  return response.classifications;
}

// Summarize text
export async function summarizeText(text: string) {
  const response = await cohere.summarize({
    text,
    length: 'medium',
  });

  return response.summary;
}

// Detect language
export async function detectLanguage(texts: string[]) {
  const response = await cohere.detectLanguage({
    texts,
  });

  return response.results;
}

export { cohere };
