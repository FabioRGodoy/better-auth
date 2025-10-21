import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteDto } from './dto/invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetRoleDto } from './dto/set-role.dto';
import { Role } from '@prisma/client';
import { ObjectIdPipe } from '../common/pipes/objectid.pipe';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teams: TeamsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(@Session() session: UserSession, @Body() dto: CreateTeamDto) {
    return this.teams.createTeam(session.user.id, dto);
  }

  @Get('mine')
  myTeams(@Session() session: UserSession) {
    return this.teams.listMyTeams(session.user.id);
  }

  @Post('invite')
  invite(@Session() session: UserSession, @Body() dto: InviteDto) {
    return this.teams.invite(session.user.id, dto);
  }

  @Post('accept-invite')
  async accept(@Session() session: UserSession, @Body() dto: AcceptInviteDto) {
    const inv = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
    });
    if (!inv) throw new BadRequestException('Convite inválido ou expirado');

    if (session.user.email.toLowerCase() !== inv.email.toLowerCase()) {
      throw new BadRequestException('Este convite não pertence ao seu e-mail');
    }
    return this.teams.acceptInvite(session.user.id, dto);
  }

  /** Lista membros (somente para quem é membro do time) */
  @Get(':teamId/members')
  members(
    @Session() session: UserSession,
    @Param('teamId', ObjectIdPipe) teamId: string,
  ) {
    return this.teams.listMembersForUser(session.user.id, teamId);
  }

  /** Altera role de um membro. Body: { userId, role } */
  @Patch(':teamId/role')
  setRole(
    @Session() session: UserSession,
    @Param('teamId', ObjectIdPipe) teamId: string,
    @Body() dto: SetRoleDto,
  ) {
    // validação extra: role permitido
    if (![Role.OWNER, Role.ADMIN, Role.MEMBER].includes(dto.role)) {
      throw new BadRequestException('Role inválida');
    }
    return this.teams.setMemberRole(session.user.id, teamId, dto);
  }
}
