import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';
import { MeModule } from './me/me.module';
import { TeamsModule } from './teams/teams.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BetterAuthModule.forRoot({ auth }),

    // Rate limiting (ex.: 60 req/min por IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // janela 60s
        limit: 60, // 60 requisições
      },
    ]),

    MeModule,
    TeamsModule,
    UserModule,
  ],
  providers: [
    // aplica o throttling globalmente
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
