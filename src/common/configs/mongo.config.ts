import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
  return {
    uri:
      'mongodb+srv://' +
      configService.get('MONGO_LOGIN') +
      ':' +
      configService.get('MONGO_PASSWORD') +
      '@' +
      configService.get('MONGO_HOST') +
      '/' +
      configService.get('MONGO_DB_NAME') +
      configService.get('MONGO_DB_OPTIONS'),
  };
};
