import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../post/post.service';
import { Roles } from 'src/core/decorator/roles.decorator';
import { RolesGuard } from 'src/core/guard/roles.guard';
import { Role } from 'src/entities/user/user.interface';
import { Post } from 'src/entities/post/post.entity';
import { ApiBearerAuth, ApiForbiddenResponse, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly postService: PostService) {}

  @ApiParam({
    name: 'postId',
    description: '삭제할 포스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '포스트 삭제 성공',
    example: {
      message: '포스트가 관리자에 의해 삭제되었습니다.',
      deletedAt: '2023-01-01T00:00:00.000Z',
      deletedBy: 'admin@example.com',
    },
  })
  @ApiForbiddenResponse({
    description: '관리자 권한 필요',
    example: {
      statusCode: 403,
      message: 'RolesGuard Error: User: user123, user role: user, Required Roles: admin is not authorized',
      error: 'Forbidden'
    }
  })
  @Delete('/posts/:postId')
  @Roles(Role.ADMIN)
  async deletePost(@Param('postId', ParseUUIDPipe) postId: Post['id']) {
    return this.postService.adminDeletePost(postId);
  }
}
