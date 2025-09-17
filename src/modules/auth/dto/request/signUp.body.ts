import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User } from 'src/entities/user/user.entity';

export class SignUpBody {
  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'user@example.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: User['email'];

  @ApiProperty({
    description: '사용자 비밀번호 (8-50, 영문+숫자 조합)',
    example: 'password123',
    minLength: 8,
    maxLength: 50,
    pattern: '^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(50, { message: '비밀번호는 최대 50자까지 가능합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  password: User['password'];

  @ApiProperty({
    description: '사용자 닉네임 (2-20자)',
    example: 'cooluser123',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @MinLength(2, {message: '닉네임은 최소 2자 이상이어야 합니다.'})
  @MaxLength(20, {message: '닉네임은 최대 20자까지 가능합니다.'})
  nickname: User['nickname'];

  toEntity(hashedPassword: User['password']): User {
    return plainToInstance(User, {
      ...this,
      password: hashedPassword,
    });
  }
}
