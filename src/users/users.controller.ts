import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.userService.update(id, updateUserDTO);
  }
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
