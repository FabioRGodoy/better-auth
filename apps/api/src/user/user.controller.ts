import { Controller, Get, Param } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * Protegido pelo guard global do BetterAuth.
   * Retorna dados públicos/essenciais de um usuário por id.
   * Dica: se quiser restringir, compare session.user.id === :id
   */
  @Get(':id')
  async getById(@Session() session: UserSession, @Param('id') id: string) {
    // opcional: restringir para o próprio usuário
    // if (session.user.id !== id) throw new ForbiddenException()

    return this.users.findById(id);
  }
}
