import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { GlobalExceptionFilter } from './filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 8080;
  const db_url = config.get<string>('DATABASE_URL');
  if (!db_url) {
    throw new Error('DATABASE_URL is not defined');
  }
  console.log(`PORT: ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap().catch((err) => console.error(err));
