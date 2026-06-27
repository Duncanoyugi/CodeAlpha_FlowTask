import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../src/lib/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Ensure tests don't leak data into other tests.
  // We keep it conservative: only clean obvious domain tables when present.
  // If a table doesn't exist in a given migration, prisma will throw; that's preferable to hiding issues.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  await prisma.task.deleteMany();
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  await prisma.comment.deleteMany();
});

