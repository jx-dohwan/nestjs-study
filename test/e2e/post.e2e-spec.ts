import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Post E2E', () => {
  let app: INestApplication;
  let userAccessToken: string;
  let adminAccessToken!: string;
  let testPostId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 테스트 사용자 및 관리자 생성
    await setupTestUsers();
  });

  async function setupTestUsers() {
    // 일반 사용자 생성
    await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'user@example.com',
      password: 'password123',
      nickname: 'testuser',
    });

    const userResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    userAccessToken = userResponse.body.accessToken;

    // 관리자 계정은 별도로 생성하거나 시드 데이터 사용
  }

  describe('/posts (GET)', () => {
    it('공개 포스트 목록을 조회할 수 있어야 합니다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('페이징 파라미터가 정상적으로 작동해야 합니다.', async () => {
      return request(app.getHttpServer())
        .get('/posts?page=1&limit=10')
        .expect(200);
    });
  });

  describe('/posts (POST)', () => {
    it('공개 포스트 목록을 조회할 수 있어야 합니다.', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('페이징 파라미터가 정상적으로 작동해야 합니다.', async () => {
        return request(app.getHttpServer())
            .get('/posts?page=1&limit=10')
            .expect(200)
    });
  });

  describe('/posts (POST)', () => {
    it('인증된 사용자가 포스트를 생성할 수 있어야 합니다.', async () => {
        const postData = {
            title: 'Test Post',
            content: 'This is a test post content',
        };

        const response = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(postData)
            .expect(201)

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(postData.title);
        testPostId = response.body.id;
    });

    it('인증되지 않은 사용자는 포스트를 생성할 수 없어야 합니다.', async () => {
        return request(app.getHttpServer())
            .post('/posts')
            .send({
                title: 'Unauthorized Post',
                content: 'This should fail',
            })
            .expect(401)
    });

  });

  describe('/posts/:id (PATCH)', () => {
    it('포스트 작성자가 포스트를 수정할 수 있어야 합니다.', async () => {
        const updateData = {
            title:'Updated Test Post',
            content: 'Updated content',
        };

        return request(app.getHttpServer())
            .patch(`/posts/${testPostId}`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(updateData)
            .expect(200);
    });

    it('다른 사용자는 포스트를 수정할 수 없어야 합니다.', async () => {
        // 다른 사용자 토큰으로 테스트
        return request(app.getHttpServer())
            .patch(`/posts/${testPostId}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({title:'Hacked Title'})
            .expect(403);
    });
  });
});
