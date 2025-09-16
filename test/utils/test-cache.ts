export function getTestRedisConfig() {
    return {
      host: 'localhost',
      port: 6380,
      password: 'test_password',
      db: 1, // 테스트 전용 DB
    };
  }