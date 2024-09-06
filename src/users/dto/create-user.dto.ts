import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDTO {
  @IsOptional()
  firstName: string;
  @IsOptional()
  lastName: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
