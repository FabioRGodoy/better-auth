import { IsEnum, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class SetRoleDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}
