# PulseStream - AI & Streaming Implementation

## Overview
This document describes the AI models, streaming, and search technologies implementation added to PulseStream.

## Technologies Added

### 1. Anthropic Claude
- **@anthropic-ai/sdk** - Anthropic Claude API client

### 2. Cohere
- **cohere-ai** - Cohere API client

### 3. Pinecone
- **@pinecone-database/pinecone** - Vector database client

### 4. LangChain
- **langchain** - LangChain core
- **@langchain/core** - LangChain primitives
- **@langchain/anthropic** - Anthropic integration
- **@langchain/cohere** - Cohere integration

### 5. Vercel AI SDK
- **ai** - Vercel AI SDK
- **@vercel/ai-sdk** - Vercel AI SDK

### 6. Perplexity AI
- **@perplexity-ai/sdk** - Perplexity AI client

### 7. GraphQL
- **graphql** - GraphQL core
- **graphql-ws** - WebSocket subscriptions
- **graphql-subscriptions** - Subscription utilities
- **@apollo/client** - Apollo Client
- **@apollo/server** - Apollo Server
- **@as-integrations/next** - Next.js integration

### 8. Kafka
- **kafkajs** - Kafka client
- **@kafkajs/confluent-schema-registry** - Schema registry

### 9. Elasticsearch
- **@elastic/elasticsearch** - Elasticsearch client

### 10. WASM
- Rust-based stream processing

## Files Created

### Anthropic
- `lib/anthropic/client.ts` - Anthropic Claude client with text generation, streaming, system prompts, token counting

### Cohere
- `lib/cohere/client.ts` - Cohere client with text generation, streaming, embeddings, reranking, classification, summarization, language detection

### Pinecone
- `lib/pinecone/client.ts` - Pinecone vector database with upsert, query, delete, index management

### Perplexity
- `lib/perplexity/client.ts` - Perplexity AI client with query, streaming, and search

### Kafka
- `lib/kafka/producer.ts` - Kafka producer with message sending and batching
- `lib/kafka/consumer.ts` - Kafka consumer with subscription and message handling

### Elasticsearch
- `lib/elasticsearch/client.ts` - Elasticsearch client with CRUD, search, aggregation, bulk operations

### WASM
- `wasm/src/lib.rs` - Rust WASM functions for stream processing, metrics aggregation, anomaly detection, moving averages, exponential smoothing
- `wasm/Cargo.toml` - Rust project configuration

## Features

### Anthropic Claude
- Text generation with Claude models
- Streaming responses
- System prompt support
- Token counting

### Cohere
- Text generation with Command models
- Streaming support
- Embeddings for RAG
- Document reranking
- Text classification
- Summarization
- Language detection

### Pinecone
- Vector upsert and query
- Metadata filtering
- Index management
- Batch operations

### Perplexity AI
- Online search with Llama models
- Streaming responses
- Real-time web search integration

### Kafka
- Message production and consumption
- Batch message sending
- Transaction support
- Consumer group management

### Elasticsearch
- Document indexing and search
- Aggregations
- Bulk operations
- Real-time search

### WASM
- High-performance stream processing
- Metrics aggregation
- Anomaly detection
- Moving averages
- Exponential smoothing

## Installation Required

To use these features, run:
```bash
pnpm install
```

This will install all the AI, streaming, and search dependencies.

## Notes
- All code is written but packages are not installed (per user request)
- TypeScript errors are expected until packages are installed
- Kafka requires a running Kafka broker
- Elasticsearch requires a running Elasticsearch cluster
- Pinecone requires API key and index setup
- WASM requires Rust and wasm-pack to build
