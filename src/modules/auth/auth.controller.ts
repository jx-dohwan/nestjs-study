import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { type Response as ExpressResponse, type Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user/user.entity';
import { SignUpBody } from './dto/request/signUp.body';
import { SignInBody } from './dto/request/signIn.body';
import { CurrentUser } from 'src/core/decorator/currentUser.decorator';
import { CurrentRefreshToken } from 'src/core/decorator/currentRefreshToken.decorator';
import { ExtractJwt } from 'passport-jwt';
import { Public } from 'src/core/decorator/public.decorator';
import { RefreshTokenGuard } from 'src/core/guard/refreshToken.guard';
import { Env } from 'src/core/config';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SignInResponse } from './dto/response/signIn.response';

@Controller('auth')
export class AuthController {
  private readonly isLocal: boolean;

  constructor(private readonly authService: AuthService) {
    this.isLocal = process.env.NODE_ENV === Env.local;
  }

  private setRefreshTokenCookie(
    res: ExpressResponse,
    refreshToken: string,
  ): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: !this.isLocal,
      secure: !this.isLocal,
      sameSite: this.isLocal ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: ExpressResponse): void {
    res.clearCookie('refreshToken', {
      httpOnly: !this.isLocal,
      secure: !this.isLocal,
      sameSite: this.isLocal ? 'none' : 'strict',
    });
  }

  @ApiOperation({
    summary:'회원가입',
    description:`
      새로운 사용자 계정을 생성합니다.

      **주의사항:**
        - 이메일은 유일해야 합니다.
        - 비밀번호는 최소 8자 이상이어야 합니다.
        - 닉네임은 2-20자 사이여야 합니다.
    `
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: 'object',
    example: {
      message :'회원가입이 완료되었습니다.'
    }
  })
  @ApiConflictResponse({
    description: '이미 존재하는 이메일',
    example: {
      statusCode: 409,
      message : 'User already exists',
      error: 'Conflict'
    }
  })
  @ApiBadRequestResponse({
    description: '유효하지 않은 입력 데이터',
    example: {
      statusCode: 400,
      message: [
        'email must be an eamil',
        'password must be longer than or equal to 8 characters',
        'nickname must be longer than or equal to 2 characters'
      ],
      error: 'Bad Request'
    }
  })
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignUpBody) {
    return this.authService.signUp(body);
  }

  @ApiOperation({
    summary: '로그인',
    description: `
      사용자 인증을 수행하고 JWT 토큰을 발급합니다.

      **응답 정보:**
        - accessToken: API 호출에 사용할 인증 토큰 (Header에 포함)
        - refreshToken: HttpOnly 쿠키로 자동 저장됨

      **토큰 유효기간:**
        - accessToken: 1시간
        - refreshToken: 7일
    `
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: SignInResponse,
    headers: {
      'Set-Cokkie': {
        description: 'HttpOnly 쿠키로 설정되는 refrreshToken',
        schema: {
          type: 'string',
          example: 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: '로그인 실패 (잘못된 이메일 또는 비밀번호)',
    example: {
      statusCode: 401,
      message: 'Invalid credentials',
      error:'Unauthorized'
    }
  })
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: SignInBody,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokenPair = await this.authService.signIn(body);
    this.setRefreshTokenCookie(res, tokenPair.refreshToken);

    return { accessToken: tokenPair.accessToken };
  }

  @ApiOperation({
    summary:'로그아웃',
    description: `
      현재 사용자를 로그아웃시키고 토큰을 무효화합니다.

      **처리 내용:**
      1. 현재 accessToken을 블랙리스트에 추가
      2. 사용자의 모든 refreshToken 무효화
      3. refreshToken 쿠키 삭제
    `
  })
  @ApiResponse({
    status:200,
    description: '로그아웃 성공',
    example: {
      message:'로그아웃이 완료되었습니다.'
    }
  })
  @ApiUnauthorizedResponse({
    description:'인증되지 않은 사용자',
  })
  @ApiBearerAuth('JWT-auth')
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @CurrentUser() user: User,
    @Request() req: Request,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? '';

    this.clearRefreshTokenCookie(res);

    return this.authService.signOut(user.id, accessToken);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentRefreshToken() refreshToken: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokenPair = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, tokenPair.refreshToken);

    return { accessToken: tokenPair.accessToken };
  }
}