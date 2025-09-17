import { ApiProperty } from '@nestjs/swagger';

export class UserRankResponse {
  @ApiProperty({
    description: '사용자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '코딩천재',
    type: 'string',
  })
  nickname: string;

  @ApiProperty({
    description: '사용자 점수',
    example: 12345,
    type: 'number',
  })
  score: number;

  @ApiProperty({
    description: '사용자 랭킹 (1부터 시작)',
    example: 7,
    type: 'number',
  })
  rank: number;
}
