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

  @Get('with-teams')
  async getMeWithTeams(@Session() session: UserSession) {
    const userId = session.user.id;
    const { memberships, teams } = await this.meService.getMeWithTeams(userId);

    return {
      user: session.user,
      memberships: memberships.map((m) => ({
        teamId: m.teamId,
        role: m.role,
        teamName: teams.find((t) => t.id === m.teamId)?.name ?? null,
        isOwner: teams.find((t) => t.id === m.teamId)?.ownerId === userId,
      })),
    };
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
