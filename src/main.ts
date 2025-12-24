import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.enableCors({
    origin: '*',
    // credentials: true
  });


  const config = new DocumentBuilder()
    .setTitle('Itech Quiz Up API')
    .setDescription('API documentation for the Itech Quiz Up platform')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  const port = await configService.get('PORT');

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
bootstrap();
