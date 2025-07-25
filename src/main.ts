import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS para permitir conexiones desde Angular
  app.enableCors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    })
    );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📊 API endpoints available at: http://localhost:${process.env.PORT ?? 3000}/products`);
}
bootstrap();
