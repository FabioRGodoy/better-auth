import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { InviteDto } from './dto/invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { getBetterAuthDb } from '../better-auth-db';
import { SetRoleDto } from './dto/set-role.dto';
import { addDays } from 'date-fns';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  /** OWNER ou ADMIN */
  private async ensureAdminOrOwner(userId: string, teamId: string) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId, teamId },
    });
    if (!mem || (mem.role !== Role.OWNER && mem.role !== Role.ADMIN)) {
      throw new ForbiddenException('Permissão insuficiente');
    }
  }

  /** Pelo menos membro */
  private async ensureMember(userId: string, teamId: string) {
    const mem = await this.prisma.membership.findFirst({
      where: { userId, teamId },
    });
    if (!mem) throw new ForbiddenException('Você não é membro deste time');
    return mem;
  }

  /** Passo 9 */
  async createTeam(ownerId: string, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: { name: dto.name.trim(), ownerId },
      select: { id: true, name: true, ownerId: true, createdAt: true },
    });
    await this.prisma.membership.create({
      data: { teamId: team.id, userId: ownerId, role: Role.OWNER },
    });
    return { ...team, myRole: Role.OWNER };
  }

  /** Passo 9 */
  async listMyTeams(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { teamId: true, role: true },
    });
    if (memberships.length === 0) return [];
    const teams = await this.prisma.team.findMany({
      where: { id: { in: memberships.map((m) => m.teamId) } },
      select: { id: true, name: true, ownerId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return teams.map((t) => ({
      ...t,
      myRole: memberships.find((m) => m.teamId === t.id)?.role ?? Role.MEMBER,
    }));
  }

  /** Passo 10 */
  async invite(requesterId: string, dto: InviteDto) {
    const teamId = dto.teamId;
    const email = dto.email.trim().toLowerCase();

    await this.ensureAdminOrOwner(requesterId, teamId);

    const duplicateInvite = await this.prisma.invitation.findFirst({
      where: { teamId, email },
    });
    if (duplicateInvite) {
      throw new BadRequestException(
        'Já existe um convite pendente para este e-mail',
      );
    }

    const token = randomBytes(24).toString('hex');

    // ✅ preencha os campos obrigatórios do seu schema
    await this.prisma.invitation.create({
      data: {
        teamId,
        email,
        token,
        inviterId: requesterId, // <-- novo
        expiresAt: addDays(new Date(), 7), // <-- novo (ex.: expira em 7 dias)
        // ...outros campos obrigatórios do seu schema, se houver
      },
    });

    return { token };
  }
  /** Passo 10 */
  async acceptInvite(userId: string, dto: AcceptInviteDto) {
    const inv = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
    });
    if (!inv) throw new NotFoundException('Convite inválido ou expirado');

    const alreadyMember = await this.prisma.membership.findFirst({
      where: { teamId: inv.teamId, userId },
    });
    if (alreadyMember) {
      await this.prisma.invitation.delete({ where: { token: dto.token } });
      return { ok: true, message: 'Usuário já é membro; convite removido.' };
    }

    await this.prisma.membership.create({
      data: { teamId: inv.teamId, userId, role: Role.MEMBER },
    });
    await this.prisma.invitation.delete({ where: { token: dto.token } });

    return { ok: true };
  }

  /**
   * Passo 11 — Lista membros com dados do usuário (email/nome) vindos do BetterAuth.
   */
  async listMembers(teamId: string) {
    const members = await this.prisma.membership.findMany({
      where: { teamId },
      select: { userId: true, role: true },
      orderBy: { userId: 'asc' },
    });

    if (members.length === 0) return [];

    const db = await getBetterAuthDb();
    const usersCol = db.collection<{
      id: string;
      email: string;
      name?: string | null;
    }>('users');

    const userIds = members.map((m) => m.userId);
    const users = await usersCol
      .find({ id: { $in: userIds } })
      .project({ id: 1, email: 1, name: 1, _id: 0 })
      .toArray();

    const map = new Map(users.map((u) => [u.id, u]));
    return members.map((m) => ({
      userId: m.userId,
      role: m.role,
      email: map.get(m.userId)?.email ?? null,
      name: map.get(m.userId)?.name ?? null,
      // convenience:
      isOwner: m.role === Role.OWNER,
    }));
  }

  /**
   * Passo 11 — Alterar role de um membro (ADMIN/OWNER), com proteção ao "último OWNER".
   */
  async setMemberRole(requesterId: string, teamId: string, dto: SetRoleDto) {
    await this.ensureAdminOrOwner(requesterId, teamId);

    const target = await this.prisma.membership.findUnique({
      where: { teamId_userId: { teamId, userId: dto.userId } },
    });
    if (!target) throw new NotFoundException('Membro não encontrado');

    // Não permitir remover o último OWNER do time
    if (target.role === Role.OWNER && dto.role !== Role.OWNER) {
      const owners = await this.prisma.membership.count({
        where: { teamId, role: Role.OWNER },
      });
      if (owners <= 1) {
        throw new ForbiddenException(
          'Não é permitido remover o último OWNER do time',
        );
      }
    }

    // Atualiza role
    const updated = await this.prisma.membership.update({
      where: { teamId_userId: { teamId, userId: dto.userId } },
      data: { role: dto.role },
      select: { userId: true, role: true },
    });

    return updated;
  }

  /**
   * (opcional) Verifica se quem consulta é membro, para liberar /members
   */
  async listMembersForUser(userId: string, teamId: string) {
    await this.ensureMember(userId, teamId);
    return this.listMembers(teamId);
  }
}
