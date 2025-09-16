import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { User } from '../../../src/entities/user/user.entity';
import { UserRepository } from '../../../src/modules/user/repository/user.repository';
import { getTestTypeOrmConfig } from 'test/utils/test-database';

describe('AuthService Integration', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestTypeOrmConfig()),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        AuthService,
        UserRepository,
        // .. other real providers
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // 테스트 데이터베이스 초기화
    const repository = module.get<UserRepository>(UserRepository);
    await repository.query('DELETE FROM users');
  });

  describe('사용자 회원가입 프로세스', () => {
    it('전체 회원가입 프로세스가 정상적으로 작동해야 합니다.', async () => {
      // Arrange
      const signUpData = {
        email: 'integration@example.com',
        password: 'password123',
        nickname: 'integrationuser',
        // 🔧 핵심 수정: 객체 리터럴 대신 'User' 인스턴스를 만들어 반환
        toEntity: (hashedPassword: string): User => {
          const u = new User();
          // (선택) 테스트용으로 미리 아이디를 줄 수도 있음
          // u.id = randomUUID();

          u.email = 'integration@example.com';
          u.password = hashedPassword;
          u.nickname = 'integrationuser';
          u.role = 'user';
          u.score = 0;

          // 타입상 필수 멤버 대비 (엔티티에 선언만 돼 있으면 할당은 필수 아님)
          // 관계 필드가 필수라면 초기화
          // u.Posts = [];

          // createdAt/updatedAt은 @CreateDateColumn/@UpdateDateColumn으로 DB가 채움
          // deletedAt은 nullable이면 굳이 지정할 필요 X

          return u; // ✅ User 타입 충족
        },
      };

      // Act
      await service.signUp(signUpData);

      // Assert
      const user = await service.validateUser(
        signUpData.email,
        signUpData.password,
      );
      expect(user).toBeTruthy();
      expect(user?.email).toBe(signUpData.email);
      expect(user?.nickname).toBe(signUpData.nickname);
    });
  });
});
