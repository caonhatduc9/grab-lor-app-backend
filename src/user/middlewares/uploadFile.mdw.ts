import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class UploadFileMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    new (FileInterceptor('avatar', {
      storage: diskStorage({
        destination: this.configService.get<string>('UPLOAD_FOLDER'), // Set your desired destination folder for uploaded avatars
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `avatar-${req.params.id}-${uniqueSuffix}${file.originalname}`,
          );
        },
      }),
    }))(req, res, next);
  }
}
