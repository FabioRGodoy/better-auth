import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { MeModule } from './me/me.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { PrismaService } from '@repo/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BetterAuthModule.forRoot({ auth }),

    // Rate limiting (ex.: 60 req/min por IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // janela 60s
        limit: 60, // 60 requisições
      },
    ]),

    MeModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AppService,
    // aplica o throttling globalmente
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
