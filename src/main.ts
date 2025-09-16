import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setNestApp } from './setNestApp';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('NestJS Study API')
    .setDescription('NestJS Study 프로젝트 API')
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관련 API')
    .addTag('posts', '포스트 관련 API')
    .addTag('admin', '관리자 관련 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth' // 컨트롤러에서 참조할 키
    )
    .addCookieAuth('refreshToken', {
      type:'apiKey',
      in: 'cookie',
      name:'refreshToken',
      description:'Refresh token stored in httpOnly cookie'
    })
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // 새로고침해도 토큰 유지
        tagsSorter: 'alpha', // 태그 알파벳 순 정렬
        operationsSorter: 'alpha' // API 엔드포인트 알파벳 순 정렬
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
      customSiteTitle: 'NestJS Paractice API Docs',
    });

  setNestApp(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();