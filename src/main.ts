import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar límites de body parser para archivos grandes
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Configurar CORS para permitir conexiones desde Angular
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://new.logolate.com', 'https://logolate.com']
    : ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:4201', 'http://127.0.0.1:4201', 'http://localhost:4202', 'http://127.0.0.1:4202'];

  app.enableCors({
    origin: allowedOrigins.filter(Boolean), // Filtra valores undefined/null
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configurar servicio de archivos estáticos para imágenes
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
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
