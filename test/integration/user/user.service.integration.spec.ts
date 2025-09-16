import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/modules/user/user.service';
import { CacheModule } from '../../../src/core/cache/cache.module';
import { LoggerService } from '../../../src/core/logger/logger.service';
import { Redis } from 'ioredis';
import { RedisClientKey } from '../../../src/core/cache/cache.interface';
// 실제 Redis 쓰지 않고 싶으면: import RedisMock from 'ioredis-mock';
import { getTestRedisConfig } from 'test/utils/test-cache';

describe('UserService Cache Integration', () => {
  let service: UserService;
  let module: TestingModule;

  // CacheModule이 생성자에서 주입받는 로거 목
  const mockLogger: jest.Mocked<LoggerService> = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      // ✅ forRoot 사용 금지. 모듈 그대로 import
      imports: [CacheModule],
      providers: [
        UserService,
        // ✅ CacheModule에 주입될 LoggerService 제공
        { provide: LoggerService, useValue: mockLogger },
      ],
    });

    // ✅ CacheModule 내부의 RedisClientKey 프로바이더를 테스트용으로 덮어쓰기
    builder.overrideProvider(RedisClientKey).useFactory({
      factory: async () => new Redis(getTestRedisConfig()),
      // 외부 의존 없애려면:
      // factory: async () => new RedisMock(),
    });

    module = await builder.compile();
    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('사용자 조회 캐싱', () => {
    it('첫 번째 조회 후 캐시에서 데이터를 가져와야 합니다.', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const firstCall = await service.getUser(userId);
      const secondCall = await service.getUser(userId);

      // Assert
      expect(firstCall).toEqual(secondCall);

      // 💡 캐시 미스/히트 로그 검사 (CacheModule.wrapMethod의 로깅 형식에 맞춤)
      // wrapMethod 내부: loggerService.info(cacheKey, result, 'cache miss' | 'cache hit')
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(''), // cacheKey
        expect.anything(),           // value
        'cache miss',                // 첫 호출
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(''), // 같은 cacheKey
        expect.anything(),
        'cache hit',                 // 두 번째 호출
      );
    });
  });
});
