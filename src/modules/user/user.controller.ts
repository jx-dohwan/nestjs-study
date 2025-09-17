import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { User } from 'src/entities/user/user.entity';
import { UserService } from './user.service';
import { UpdateUserScoreDto } from './dto/request/updateUserScore.dto';
import { GetUsersByRankDto } from './dto/request/getUsersByRank.dto';
import { UpdateUserBody } from './dto/request/updateUser.body';
import { CurrentUser } from 'src/core/decorator/currentUser.decorator';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserRankResponse } from './dto/response/userRank.response';
import { UserResponse } from './dto/response/user.response';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({
    summary: '랭킹별 사용자 목록 조회',
    description:`
      점수 기준으로 정렬된 사용자 목록을 페이징으로 조회합니다.

      **정렬 기준:** 점수 높은 순
      **페이징:** page와 limit 파라미터 사용
    `
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항모 수',
    example: 10,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '랭킹 목록 조회 성공',
    type: [UserRankResponse]
  })
  @Get('/rank')
  async getUsersByRank(@Query() query: GetUsersByRankDto) {
    return this.service.getUsersByRank(query);
  }

  @Get('/:userId/rank')
  async getUserRank(@Param('userId', ParseUUIDPipe) userId: User['id']) {
    return this.service.getUserRank(userId);
  }

  @ApiOperation({
    summary: '내 프로필 조회',
    description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.'
  })
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: UserResponse,
  })
  @Get('/me')
  async getMe(@CurrentUser() user: User) {
    return this.service.getUser(user.id);
  }

  @ApiOperation({
    summary:'내 프로필 수정',
    description: `
      현재 로그인한 사용자의 프로필을 수정합니다.

      **수정 가능한 필드:**
      - nickname: 닉네임 (2-20자)
    `
  })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
    type: UserResponse,
  })
  @Patch('/me')
  async updateMe(@CurrentUser() user: User, @Body() body: UpdateUserBody) {
    return this.service.updateUser(user.id, body);
  }

  @Patch('/:userId/score')
  async updateScore(
    @Param('userId', ParseUUIDPipe) userId: User['id'],
    @Body() body: UpdateUserScoreDto,
  ) {
    return this.service.updateScore(userId, body.score);
  }
}