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
import { USER_LOGS } from './users.constants';

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
      const newUser = await this.prisma.user.create({
        data: creatUserDTO,
        select: { email: true, id: true },
      });

      await this.prisma.log.create({
        data: {
          action: USER_LOGS.USER_SIGNUP,
          remarks: 'User created successfully',
          user: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });
      return newUser;
    } catch (error) {
      console.error(`Error while creating new user`, error.message);
      throw new InternalServerErrorException('Signup user failed', {
        cause: new Error(),
        description: 'Error while signup user',
      });
    }
  }
  async login(payload: LoginUserDTO): Promise<{ accessToken: string }> {
    try {
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
      await this.prisma.log.create({
        data: {
          action: USER_LOGS.USER_LOGIN,
          remarks: 'User logged in successfully',
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      return { accessToken };
    } catch (error) {
      console.error('Error while login user', error.message);
      throw new InternalServerErrorException();
    }
  }
  async update(id: number, updateUserDTO: UpdateUserDTO) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!userExist) {
        throw new NotFoundException('Could not find the user');
      }

      if (updateUserDTO.email) {
        const alreadyCreatedUser = await this.prisma.user.findUnique({
          where: { email: updateUserDTO.email },
        });
        if (alreadyCreatedUser) {
          throw new Error('User already created with this email');
        }
      }
      if (updateUserDTO.password) {
        updateUserDTO.password = await this.passwordService.generateHash(
          updateUserDTO.password,
          10,
        );
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDTO,
        select: {
          email: true,
          firstName: true,
          lastName: true,
          id: true,
        },
      });

      await this.prisma.log.create({
        data: {
          action: USER_LOGS.USER_UPDATED,
          remarks: 'User updated successfully',
          user: {
            connect: {
              id: updatedUser.id,
            },
          },
        },
      });
      return updatedUser;
    } catch (error) {
      console.error(`Error while updating user ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  async delete(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const results = await this.prisma.user.delete({
        where: { id },
        select: { id: true, email: true },
      });

      return results;
    } catch (error) {
      console.error(`Error while deleting user ${error.message}`);
      throw new InternalServerErrorException();
    }
  }
}
