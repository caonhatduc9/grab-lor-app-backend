import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  console.log('Frontend URL== ', configService.get('FRONTEND_URL'));
  app.enableCors({
    origin: [configService.get('FRONTEND_URL'), "localhost:5173"],
    credentials: true,
  });
  await app.listen(process.env.BACKEND_PORT || 3500);
}
bootstrap();
