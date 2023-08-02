import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UploadImageModule } from './upload-image/upload-image.module';
import { UserModule } from './user/user.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), DatabaseModule, AuthModule, UploadImageModule, UserModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
