import { Controller, Get } from '@nestjs/common';
import {
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@Session() session: UserSession) {
    return session.user;
  }

  @AllowAnonymous()
  @Get('public')
  publicExample() {
    return { ok: true, time: new Date().toISOString() };
  }

  @OptionalAuth()
  @Get('optional')
  optional(@Session() session: UserSession | null) {
    return { user: session?.user ?? null };
  }
}
