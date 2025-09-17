import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Validation failed',
  })
  message: string | string[];

  @ApiProperty({
    description: '에러 타입',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: '에러 발생 시각',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: '요청 경로',
    example: '/api/posts',
  })
  path: string;
}
