import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { Post } from "src/entities/post/post.entity";
import { UserResponse } from "src/modules/user/dto/response/user.response";

@Exclude()
export class PostResponse {
    @ApiProperty({
        description: '포스트 고유 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description:'포스트 제목',
        example: '첫 번째 포스트입니다.',
    })
    @Expose()
    title: string;

    @ApiProperty({
        description: '포스트 내용',
        example: '안녕하세요! 첫 번째 포스트를 작성합니다.',
    })
    @Expose()
    content: string;

    @ApiProperty({
        description: '포스트 작성 정보',
        type: UserResponse,
    })
    @Expose()
    @Type(() => UserResponse)
    user: UserResponse;

    @ApiProperty({
        description: '포스트 생성일',
        example: '2023-01-01T00:00:00.000Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description:'포스트 수정일',
        example: '2023-01-01T00:00:00.000Z',
    })
    @Expose()
    updatedAt: Date;

    constructor(post: Post) {
        Object.assign(this, post);
        if (post.User) {
            this.user = new UserResponse(post.User);
        }
    }
}