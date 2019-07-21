import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateway.module'
import { ControllersModule } from './routes/controllers.module';
import { DatabaseService } from './services/database.service';
import { ServicesModule } from './services/services.module';
import { RoomsGateway } from './gateways/rooms.gateway';

@Module({
  imports: [ GatewaysModule, ControllersModule, ServicesModule ],
})
export class AppModule {}
