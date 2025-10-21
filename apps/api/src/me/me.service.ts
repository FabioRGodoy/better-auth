import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeWithTeams(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { teamId: true, role: true },
    });

    if (memberships.length === 0) {
      return {
        memberships: [],
        teams: [] as Array<{ id: string; name: string; ownerId: string }>,
      };
    }

    const teams = await this.prisma.team.findMany({
      where: { id: { in: memberships.map((m) => m.teamId) } },
      select: { id: true, name: true, ownerId: true },
    });

    return { memberships, teams };
  }
}
