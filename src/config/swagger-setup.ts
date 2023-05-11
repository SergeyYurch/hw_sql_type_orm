import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerSetup(app: NestExpressApplication) {
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
