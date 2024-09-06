import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { LoginUserDTO } from './dtos/login-user.dto';
import { AuthGuard } from './auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Post('/signup')
  async create(
    @Body()
    createUserDTO: CreateUserDTO,
  ) {
    return await this.userService.signup(createUserDTO);
  }

  @Post('/login')
  async login(
    @Body()
    loginUserDTO: LoginUserDTO,
  ) {
    return await this.userService.login(loginUserDTO);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
