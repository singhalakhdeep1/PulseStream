import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PulseStream database...');

  const streamer = await prisma.user.upsert({
    where: { email: 'streamer@pulsestream.tv' },
    update: {},
    create: {
      username: 'pulse_pro',
      email: 'streamer@pulsestream.tv',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    },
  });

  await prisma.stream.upsert({
    where: { streamKey: 'live_pk_99201192' },
    update: {},
    create: {
      title: 'Live 4K Gaming Broadcast & Realtime Chat',
      streamKey: 'live_pk_99201192',
      isLive: true,
      viewerCount: 1420,
      userId: streamer.id,
    },
  });

  console.log('Seeding complete for PulseStream.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
