import { Module } from '@nestjs/common';
import { ClsModule as NestClsModule } from 'nestjs-cls';
import { RequestContextService } from './cls.service';

@Module({
  imports: [
    NestClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
      },
    }),
  ],
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class ClsModule {}