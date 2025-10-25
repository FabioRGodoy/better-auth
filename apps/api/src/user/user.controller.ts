import { Controller, Get, Param } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async getMany() {
    return this.users.getMany();
  }

  @Get(':id')
  async getById(@Session() session: UserSession, @Param('id') id: string) {
    return this.users.findById(id);
  }
}
