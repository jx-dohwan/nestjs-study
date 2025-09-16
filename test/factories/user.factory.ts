import { User } from '../../src/entities/user/user.entity';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      password: 'hashedPassword',
      nickname: 'testuser',
      role: 'user',
      score: 0,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides,
    } as User;
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      role: 'admin',
      email: 'admin@example.com',
      nickname: 'admin',
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `user-${index + 1}`,
        email: `user${index + 1}@example.com`,
        nickname: `user${index + 1}`,
        ...overrides,
      }),
    );
  }
}