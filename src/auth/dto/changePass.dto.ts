import { IsEmail, IsNotEmpty, isNotEmpty } from 'class-validator';

export class ChangePassDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  currentPassword: string;
  @IsNotEmpty()
  newPassword: string;
}
