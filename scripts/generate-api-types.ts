import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';

async function generateApiTypes() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('API Types').build();

  const document = SwaggerModule.createDocument(app, config);

  // OpenAPI 스펙을 JSON으로 출력
  fs.writeFileSync('./api-spec.json', JSON.stringify(document, null, 2));

  console.log('API 스펙이 api-spec.json 파일로 생성되었습니다.');
  console.log('프론트엔드에서 다음 명령어로 타입을 생성하세요:');
  console.log('npx openapi-typescript api-spec.json --output types/api.ts');

  await app.close();
}
generateApiTypes();