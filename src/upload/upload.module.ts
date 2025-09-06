import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { HostingerService } from './hostinger.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [HostingerService],
  exports: [HostingerService],
})
export class UploadModule {}
