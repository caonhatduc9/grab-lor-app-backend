import { Module } from '@nestjs/common';
import { UploadImageService } from './upload-image.service';
import { UploadImageController } from './upload-image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('UPLOAD_FOLDER'), // Lấy giá trị của 'uploads' từ ConfigService
      }),
      inject: [ConfigService], // Inject ConfigService vào useFactory
    }),
  ],
  controllers: [UploadImageController],
  providers: [UploadImageService],
  exports: [UploadImageService]
})
export class UploadImageModule { }
