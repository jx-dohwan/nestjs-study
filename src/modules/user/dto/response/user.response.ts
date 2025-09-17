import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { User } from "src/entities/user/user.entity";

@Exclude()
export class UserResponse {
    @ApiProperty({
        description: '사용자 고유 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: '이메일 주소',
        example: 'user@example.com'
    })
    @Expose()
    email: string;

    @ApiProperty({
        description:'사용자 닉네임',
        example: 'cooluser123',
    })
    @Expose()
    nickname: string;

    @ApiProperty({
        description:'사용자 역할',
        example:'user',
        enum: ['user', 'admin'],
    })
    @Expose()
    role: string;

    @ApiProperty({
        description:'사용자 점수',
        example:1250,
    })
    @Expose()
    score: number;

    @ApiProperty({
        description:'계정 생성일',
        example: '2023-01-01T00:00:00.000Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: '최종 수정일',
        example: '2023-01-01T00:00:00.000Z',
    })
    @Expose()
    updatedAt:Date;

    constructor(user: User) {
        Object.assign(this, user)
    }

}