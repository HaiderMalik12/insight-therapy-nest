import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { AuthGuard } from './auth/auth.guard';
import { UpdateUserDTO } from './dto/update-user.dto';

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

  @Put('/:id')
  async update(
    @Body()
    updateUserDTO: UpdateUserDTO,
  ) {
    return updateUserDTO;
    // updateUserDTO: UpdateUserDTO, // @Body()
    // A user can update their email
    // A user can update their password
    // A user can update their firstName, lastName
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
