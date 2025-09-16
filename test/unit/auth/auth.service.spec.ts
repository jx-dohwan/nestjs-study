import {Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserRepository } from '../../../src/modules/user/repository/user.repository';
import { JwtService } from '../../../src/core/jwt/jwt.service';
import { LoggerService } from '../../../src/core/logger/logger.service';
import { HASH_SERVICE, IHashService } from '../../../src/core/hash/hash.interface';
import { NOTIFICATION_SERVICE, INotificationService } from '../../../src/core/notification/notification.interface';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    let jwtService: jest.Mocked<JwtService>;
    let hashService: jest.Mocked<IHashService>;
    let notificationService: jest.Mocked<INotificationService>;

    // Test Data Factory
    const createMockUser = (overrides = {}) => ({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashedPassword',
        nickname: 'testuser',
        role: 'user' as const,
        score: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        generateUuid: jest.fn(),      
        Posts: [],    
        ...overrides,
    });

    beforeEach(async () => {
        // Mock implementations
        const mockUserRepository = {
            findOneByFilters: jest.fn(),
            save: jest.fn(),
        };

        const mockJwtService = {
            generateTokenPair: jest.fn(),
            revokeAllUserTokens: jest.fn(),
            refreshTokens: jest.fn(),
        };

        const mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const mockNotificationService = {
            seedWelcomeNotification: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserRepository, useValue: mockUserRepository},
                { provide: JwtService, useValue: mockJwtService},
                { provide: LoggerService, useValue: {error: jest.fn(), info: jest.fn()}},
                { provide: HASH_SERVICE, useValue: mockHashService},
                { provide: NOTIFICATION_SERVICE, useValue: mockNotificationService},
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get(UserRepository);
        jwtService = module.get(JwtService);
        hashService = module.get(HASH_SERVICE);
        notificationService = module.get(NOTIFICATION_SERVICE);
    });

    describe('validateUser', () => {
        it('사용자가 존재하고 비밀번호가 올바른 경우 사용자를 반환해야 합니다.', async () => {
            //Arrage
            const mockUser = createMockUser();
            const email = 'test@example.com';
            const password = 'password123';

            userRepository.findOneByFilters.mockResolvedValue(mockUser);
            hashService.compare.mockResolvedValue(true);

            // Act
            const result = await service.validateUser(email, password);

            // Assert
            expect(result).toEqual(mockUser);
            expect(userRepository.findOneByFilters).toHaveBeenCalledWith({email});
            expect(hashService.compare).toHaveBeenCalledWith(password, mockUser.password);
        });

        it('사용자가 존재하지 않는 경우 null을 반환해야 합니다.', async () => {
            // Arrange
            userRepository.findOneByFilters.mockResolvedValue(null);

            // Act
            const result = await service.validateUser('fdftetere@example.com', 'password');

            // Assert
            expect(result).toBeNull();
            expect(hashService.compare).not.toHaveBeenCalled();
        });

        it('비밀번호가 틀린 경우 null을 반환해야 합니다.', async () => {
            // Arrange
            const mockUser = createMockUser();
            userRepository.findOneByFilters.mockResolvedValue(mockUser);
            hashService.compare.mockResolvedValue(false);

            // Act
            const result = await service.validateUser('test@example.com', 'wrongpassword');

            // Assert
            expect(result).toBeNull();
            expect(hashService.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
        });

    });

    describe('signUp', () => {
        it('새 사용자 회원가입이 성공해야 합니다.', async () => {
            // Arrange
            const signUpData = {
                email: 'new@example.com',
                password: 'password123',
                nickname: 'newuser',
                toEntity: jest.fn().mockReturnValue(createMockUser()),
            };

            userRepository.findOneByFilters.mockResolvedValue(null);
            hashService.hash.mockResolvedValue('hashedPassword');
            userRepository.save.mockResolvedValue(createMockUser());

            // Act
            await service.signUp(signUpData);

            // Assert
            expect(userRepository.findOneByFilters).toHaveBeenCalledWith({email: signUpData.email});
            expect(hashService.hash).toHaveBeenCalledWith(signUpData.password);
            expect(userRepository.save).toHaveBeenCalled();
            expect(notificationService.sendWelcomeNotification).toHaveBeenCalledWith(
                signUpData.email,
                signUpData.nickname
            );
        });

        it('이미 존재하는 사용자인 경우 ConflictException을 던져야 합니다.', async () => {
            // Arrange
            const signUpData = {
                email: 'existing@example.com',
                password: 'password123',
                nickname: 'existinguser',
                toEntity: jest.fn(),
            };

            userRepository.findOneByFilters.mockResolvedValue(createMockUser());

            // Act & Assert
            await expect(service.signUp(signUpData)).rejects.toThrow(ConflictException);
            expect(hashService.hash).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        })
    })
})