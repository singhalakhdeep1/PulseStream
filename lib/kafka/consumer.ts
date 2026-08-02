import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'pulsestream-consumer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export interface ConsumerConfig {
  groupId: string;
  topics: string[];
  fromBeginning?: boolean;
}

// Create consumer
export function createConsumer(config: ConsumerConfig): Consumer {
  const consumer = kafka.consumer({
    groupId: config.groupId,
  });

  return consumer;
}

// Connect and subscribe
export async function connectAndSubscribe(
  consumer: Consumer,
  topics: string[],
  fromBeginning: boolean = false
) {
  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning });
}

// Run consumer with handler
export async function runConsumer(
  consumer: Consumer,
  handler: (payload: EachMessagePayload) => Promise<void>
) {
  await consumer.run({
    eachMessage: handler,
  });
}

// Disconnect consumer
export async function disconnectConsumer(consumer: Consumer) {
  await consumer.disconnect();
}

// Get consumer group lag
export async function getConsumerLag(groupId: string, topic: string) {
  const admin = kafka.admin();
  await admin.connect();

  const offsets = await admin.fetchOffsets({
    groupId,
    topics: [{ topic }],
  });

  await admin.disconnect();
  return offsets;
}

export { kafka };
