import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setNestApp } from './setNestApp';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerCustomOptions } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // (선택) 파비콘/정적 파일 서빙: /public/favicon.ico -> http://localhost:3000/favicon.ico
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Swagger 문서 기본 정보
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
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description: 'Refresh token stored in httpOnly cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ⬇️ 고급 UI 옵션 (질문 주신 swaggerOptions 통째로 적용)
  const swaggerUiOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none', // 'list' | 'full' | 'none'
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,

      // 기존에 쓰시던 정렬 옵션도 함께 유지
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { 
        color: #3b82f6; 
        font-size: 2rem;
      }
      .swagger-ui .scheme-container { 
        background: #f8fafc; 
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
      }
      .swagger-ui .opblock .opblock-summary {
        border-left: 4px solid #3b82f6;
        padding-left: 10px;
      }
    `,
    customSiteTitle: 'NestJS Practice API Docs', // (오타 수정: Paractice -> Practice)
    customfavIcon: '/favicon.ico',

    // (선택) JSON/YAML 경로 고정하고 싶으면 주석 해제
    // jsonDocumentUrl: 'openapi.json', // => /openapi.json
    // yamlDocumentUrl: 'openapi.yaml', // => /openapi.yaml
  };

  SwaggerModule.setup('api', app, document, swaggerUiOptions);

  setNestApp(app);
  await app.listen(process.env.PORT ?? 3000);
  // 이제 UI: http://localhost:3000/api
  // JSON: http://localhost:3000/api-json (jsonDocumentUrl 지정 시 /openapi.json)
}
bootstrap();
