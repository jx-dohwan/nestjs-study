import 'reflect-metadata';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

beforeAll(async () => {
  // 테스트 데이터베이스 컨테이너 시작
  await execAsync('docker-compose -f docker-compose.test.yml up -d');
  
  // 데이터베이스가 준비될 때까지 대기
  await new Promise(resolve => setTimeout(resolve, 5000));
}, 30000);

afterAll(async () => {
  // 테스트 데이터베이스 정리
  await execAsync('docker-compose -f docker-compose.test.yml down -v');
}, 30000);