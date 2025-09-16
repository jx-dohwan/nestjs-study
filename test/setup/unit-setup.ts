import 'reflect-metadata';
import { initializeTransactionalContext } from 'typeorm-transactional';

// 트랜잭셔널 컨텍스트 1회 초기화
beforeAll(() => {
  initializeTransactionalContext();
});
