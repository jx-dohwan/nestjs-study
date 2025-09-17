import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostBody } from './dto/request/createPostBody';
import { UpdatePostBody } from './dto/request/updatePost.body';
import { GetPostsQuery } from './dto/request/getPosts.query';
import { CurrentUser } from 'src/core/decorator/currentUser.decorator';
import { User } from 'src/entities/user/user.entity';
import { Public } from 'src/core/decorator/public.decorator';
import { Post as PostEntity } from 'src/entities/post/post.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PostListResponse } from './dto/response/postList.response';
import { PostResponse } from './dto/response/post.response';

@Controller('posts')
export class PostController {
  constructor(private readonly service: PostService) {}

  @ApiOperation({
    summary: '포스트 목록 조회 (공개)',
    description: `
      모든 포스트 목록을 페이징으로 조회합니다.
      인증 없이 접근 가능한 공개 API입니다.
      
      **정렬:** 최신 생성순
      **페이징:** page, limit 파라미터 사용
    `,
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항목 수',
    example: 10,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '포스트 목록 조회 성공',
    type: PostListResponse,
  })
  @Public()
  @Get()
  async getPosts(@Query() query: GetPostsQuery) {
    return this.service.getPosts(query);
  }

  @Public()
  @Get('/:id')
  async getPost(@Param('id', ParseUUIDPipe) postId: PostEntity['id']) {
    return this.service.getPost(postId);
  }

  @ApiOperation({
    summary: '포스트 작성',
    description: `
      새로운 포스트를 작성합니다.
      
      **권한:** 로그인한 사용자만 가능
      **작성자:** 현재 로그인한 사용자로 자동 설정
    `,
  })
  @ApiCreatedResponse({
    description: '포스트 작성 성공',
    type: PostResponse,
  })
  @ApiBearerAuth('JWT-auth')
  @Post()
  async createPost(@CurrentUser() user: User, @Body() body: CreatePostBody) {
    return this.service.createPost(user.id, body);
  }

  @ApiOperation({
    summary: '포스트 수정',
    description: `
      기존 포스트를 수정합니다.
      
      **권한:** 포스트 작성자만 수정 가능
      **수정 가능 필드:** 제목, 내용
    `,
  })
  @ApiParam({
    name: 'id',
    description: '수정할 포스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '포스트 수정 성공',
    type: PostResponse,
  })
  @ApiForbiddenResponse({
    description: '수정 권한 없음 (작성자가 아님)',
    example: {
      statusCode: 403,
      message: '포스트 수정 권한이 없습니다.',
      error: 'Forbidden',
    },
  })
  @ApiBearerAuth('JWT-auth')
  @Patch('/:id')
  async updatePost(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) postId: PostEntity['id'],
    @Body() body: UpdatePostBody,
  ) {
    return this.service.updatePost(user.id, postId, body);
  }

  @Delete('/:id')
  async deletePost(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) postId: PostEntity['id'],
  ) {
    return this.service.deletePost(user.id, postId);
  }
}
