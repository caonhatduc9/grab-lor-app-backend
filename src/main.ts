import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: 'http://localhost:19000' };
  await app.listen(process.env.BACKEND_PORT || 3500);
}
bootstrap();
