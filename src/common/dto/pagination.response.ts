import { ApiProperty } from '@nestjs/swagger';


export class PaginationMeta {
    @ApiProperty({
        description: '현재 페이지',
        example:1,
    })
    page: number;

    @ApiProperty({
        description: '페이지당 항목 수',
        example:10,
    })
    limit: number;

    @ApiProperty({
        description: '전체 항목 수',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: '전체 페이지 수',
        example: 10,
    })
    totalPages: number;

    @ApiProperty({
        description: '다음 페이지 존재 여부',
        example: true,
    })
    hasNext: boolean;

    @ApiProperty({
        description: '이전 페이지 존재 여부',
        example: false,
    })
    hasPrev: boolean;
}

export function createPaginatedResponse<T>(dataType: any) {
    class PaginatedResponse {
      @ApiProperty({
        description: '데이터 목록',
        type: [dataType],
      })
      data: T[];
  
      @ApiProperty({
        description: '페이징 메타 정보',
        type: PaginationMeta,
      })
      meta: PaginationMeta;
    }
  
    return PaginatedResponse;
  }