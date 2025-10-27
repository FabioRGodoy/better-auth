import { PrismaClient } from '../generated/client/index.js';

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

// Reexporta o tipo para quem quiser tipar diretamente:
export type { PrismaClient } from '../generated/client/index.js';
export * as Prisma from '../generated/client/index.js';
