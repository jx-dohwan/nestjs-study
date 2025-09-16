import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../../src/core/guard/roles.guard';
import { ROLES_KEY } from '../../../src/core/decorator/roles.decorator';


describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverried: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {provide: Reflector, useValue: mockReflector},
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get(Reflector);
    });

    const createMockExecutionContext = (user:any): ExecutionContext => ({
        switchToHttp: () => ({
            getRequest: () => ({user}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
    } as any);

    it('사용자가 필요한 역할을 가진 경우 접근을 허용해야 합니다.', () => {
        // Arragne
        const context = createMockExecutionContext({id:'1', role:'admin'});
        reflector.getAllAndOverride.mockReturnValue(['admin', 'user']);

        // Act
        const result = guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
    });

    it('사용자가 필요한 역할을 가지지 않은 경우 ForbiddenException을 던져야 합니다.', () => {
        // Arrange
        const context = createMockExecutionContext({id:'1', role:'user'});
        reflector.getAllAndOverride.mockReturnValue(['admin']);

        // Act & Assert
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});