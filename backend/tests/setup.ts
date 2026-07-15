import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../src/lib/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Keep the test harness lightweight; the regression tests create their own unique rows and
  // global cleanup can collide with active transactions under Prisma/Postgres.
});

