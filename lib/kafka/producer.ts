import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'pulsestream-producer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

export interface KafkaMessage {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
}

// Connect producer
export async function connectProducer() {
  await producer.connect();
}

// Disconnect producer
export async function disconnectProducer() {
  await producer.disconnect();
}

// Send message
export async function sendMessage(message: KafkaMessage) {
  await producer.send({
    topic: message.topic,
    messages: [
      {
        key: message.key,
        value: JSON.stringify(message.value),
        headers: message.headers,
      },
    ],
  });
}

// Send batch messages
export async function sendBatch(messages: KafkaMessage[]) {
  const topicMessages: Record<string, any[]> = {};

  for (const msg of messages) {
    if (!topicMessages[msg.topic]) {
      topicMessages[msg.topic] = [];
    }
    topicMessages[msg.topic].push({
      key: msg.key,
      value: JSON.stringify(msg.value),
      headers: msg.headers,
    });
  }

  for (const [topic, msgs] of Object.entries(topicMessages)) {
    await producer.send({
      topic,
      messages: msgs,
    });
  }
}

// Create a transaction
export async function createTransaction() {
  const tx = await producer.transaction();
  return tx;
}

export { producer };
