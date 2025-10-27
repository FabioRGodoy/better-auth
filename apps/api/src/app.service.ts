import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    const users = await this.prisma.user.findMany();

    return users;
  }
}
