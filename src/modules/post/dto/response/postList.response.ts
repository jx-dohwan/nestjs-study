import { ApiProperty } from '@nestjs/swagger';
import { PostResponse } from './post.response';
import { PaginationMeta } from 'src/common/dto/pagination.response';

export class PostListResponse {
    @ApiProperty({
        description:'포스트 목록',
        type: [PostResponse],
    })
    data: PostResponse[];

    @ApiProperty({
        description:'페이징 정보',
        type: PaginationMeta,
    })
    meta: PaginationMeta;
}