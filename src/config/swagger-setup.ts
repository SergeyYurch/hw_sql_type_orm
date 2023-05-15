import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Guild docs')
    .setDescription('API description')
    .setVersion('1.0')
    // .addTag('guild')
    .addBasicAuth()
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
