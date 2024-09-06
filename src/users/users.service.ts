import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { PasswordService } from 'src/common/password/password.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}
  async signup(creatUserDTO: CreateUserDTO) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: creatUserDTO.email,
        },
      });
      if (existingUser) {
        throw new BadRequestException(
          'A user is already registered with the email provided',
          {
            cause: new Error(),
            description: 'A user is already registered with the email provided',
          },
        );
      }
      const hash = await this.passwordService.generateHash(
        creatUserDTO.password,
        10,
      );
      creatUserDTO.password = hash;
      return await this.prisma.user.create({
        data: creatUserDTO,
        select: { email: true, id: true },
      });
    } catch (error) {
      console.error(`Error while creating new user`, error.message);
      throw new InternalServerErrorException('Signup user failed', {
        cause: new Error(),
        description: 'Error while signup user',
      });
    }
  }
  async login(payload: LoginUserDTO): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findFirst({
      where: { email: payload.email },
    });
    if (!user) {
      throw new NotFoundException('Could not find user', {
        cause: new Error(),
        description: 'There is no user in our system',
      });
    }
    const passwordMatched = await this.passwordService.decryptPassword(
      payload.password,
      user.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException();
    }
    const tokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return { accessToken };
  }
  async update(id: number, updateUserDTO: UpdateUserDTO) {
    const userExist = await this.prisma.user.findFirst({
      where: { id },
    });
    if (!userExist) {
      throw new NotFoundException('Could not find the user');
    }
    if (updateUserDTO.password) {
      updateUserDTO.password = await this.passwordService.generateHash(
        updateUserDTO.password,
        10,
      );
    }
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDTO,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        id: true,
      },
    });
  }
}
