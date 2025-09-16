import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user/user.entity';
import { UserController } from 'src/modules/user/user.controller';
import { UserService } from 'src/modules/user/user.service';


describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  // User 엔티티와 시그니처에 맞춘 팩토리
  const makeMockUser = (overrides: Partial<User> = {}): User => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    nickname: 'testuser',
    role: 'user' as const,
    score: 100,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    generateUuid: jest.fn(),

    // ❗️에러의 원인이던 필수 필드
    // 정확한 타입을 모르더라도 User['Posts']로 안전 캐스팅
    Posts: [] as unknown as User['Posts'],

    ...overrides,
  });

  const mockUser = makeMockUser();

  beforeEach(async () => {
    const mockUserService: jest.Mocked<UserService> = {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      getUserRank: jest.fn(),
      getUsersByRank: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe('getMe', () => {
    it('현재 사용자 정보를 반환해야 합니다', async () => {
      // Arrange
      // 서비스 반환 타입이 OmitUppercaseProps<User> 형태라면 캐스팅으로 완화
      service.getUser.mockResolvedValue(mockUser as any);

      // Act
      const result = await controller.getMe(mockUser); // 컨트롤러 인자는 User로 가정

      // Assert
      expect(result).toEqual(mockUser);
      expect(service.getUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateMe', () => {
    it('사용자 정보를 업데이트해야 합니다', async () => {
      // Arrange
      const updateData = { nickname: 'updateduser' };
      const updatedUser = makeMockUser({ nickname: 'updateduser' });
      service.updateUser.mockResolvedValue(updatedUser as any);

      // Act
      const result = await controller.updateMe(mockUser, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(service.updateUser).toHaveBeenCalledWith(mockUser.id, updateData);
    });
  });
});
