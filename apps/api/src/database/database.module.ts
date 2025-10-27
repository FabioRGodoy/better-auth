import { Global, Module } from '@nestjs/common';
import { prisma } from '@repo/database';
import type { PrismaClient } from '@repo/database';

const PRISMA_CLIENT = 'PRISMA_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (): PrismaClient => {
        if (prisma instanceof Error) throw prisma;
        return prisma as PrismaClient;
      },
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class DatabaseModule {}
