import { Controller, Get, Req, Param } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { UsersService } from './user.service';
import { auth } from 'src/auth/auth';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService<typeof auth>,
  ) {}

  @Get()
  async getMany(@Req() req: Request) {
    // const accounts = await this.authService.api.listUserAccounts({
    //   headers: fromNodeHeaders(req.headers),
    // });

    const { users } = await this.authService.api.listUsers({
      query: {
        limit: 100,
        offset: 0,
      },
      headers: fromNodeHeaders(req.headers),
    });

    return users;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
