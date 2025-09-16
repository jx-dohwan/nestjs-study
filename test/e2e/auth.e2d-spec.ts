import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getTestTypeOrmConfig } from '../utils/test-database';
import { DataSource } from 'typeorm';
import { sign } from 'crypto';

describe('Authentication E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule.forRoot())
      .useModule(TypeOrmModule.forRoot(getTestTypeOrmConfig()))
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 데이터베이스 초기화
    const connection = app.get(DataSource);
    await connection.query('DELETE FROM users');
  });

  describe('/auth/signup (POST)', () => {
    it('올바른 데이터로 회원가입이 성공해야 합니다.', async () => {
      const signUpData = {
        email: 'e2e@example.com',
        password: 'password123',
        nickname: 'e2euser',
      };

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpData)
        .expect(201);
    });

    it('중복된 이메일로 회원가입 시 409 에러가 발생해야 합니다.', async () => {
      const signUpData = {
        email: 'duplicate@example.com',
        password: 'password123',
        nickname: 'user1',
      };

      // 첫 번째 회원가입
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpData)
        .expect(201);

      // 중복 회원가입 시도
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signUpData, nickname: 'user2' })
        .expect(409);
    });

    it('유효하지 않은 이메일 형식은 400 에러가 발생해야 합니다', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          nickname: 'user',
        })
        .expect(400);
    });
  });

  describe('/auth/signin (POST)', () => {
    beforeEach(async () => {
      // 테스트 사용자 생성
      await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'signin@example.com',
        password: 'password123',
        nickname: 'signinuser',
      });
    });

    it('올바른 자격 증명으로 로그인이 성공해야 합니다.', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined(); // refreshToken 쿠키
    });

    it('틀린 비밀번호로 로그인 시 401 에러가 발생해야 합니다.', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeEach(async () => {
      //사용자 생성 및 로그인
      await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'protected@example.com',
        password: 'password123',
        nickname: 'protecteduser',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'protected@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
    });

    it('유효한 토큰으로 보호된 라우트에 접근할 수 있어야 합니다.', async () => {
      return request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('토큰 없이 보호된 라우트에 접근 시 401 에러가 발생해야 합니다.', async () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });
});
