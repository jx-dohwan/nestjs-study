import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
  } from '@nestjs/common';import { User } from 'src/entities/user/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('/:userId')
  async getUser(@Param('userId', ParseUUIDPipe) userId: User['id']) {
    return this.service.getUser(userId);
  }
}