import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import * as path from 'path';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(path.resolve(__dirname + '..\\..\\..\\', '.env')),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
