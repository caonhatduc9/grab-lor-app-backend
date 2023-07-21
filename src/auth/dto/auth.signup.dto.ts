import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSignupDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  readonly role: string;
}
