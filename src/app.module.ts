import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateway.module';
import { ControllersModule } from './routes/controllers.module';
import { ConfigModule } from './config/config.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ GatewaysModule, ControllersModule, ServicesModule ],
})
export class AppModule {}
