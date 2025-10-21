import { IsEmail, IsString } from 'class-validator';

export class InviteDto {
  @IsString() teamId!: string;
  @IsEmail() email!: string;
}
