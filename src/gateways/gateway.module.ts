import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { UsersGateway } from './users.gateway';
import { RTCGateway } from './rtc.gateway';
import { AuthGateway } from './auth.gateway';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { RTCService } from '../services/rtc.service';
import { TokenService } from '../services/token.service';
import { DatabaseService } from '../services/database.service';
import { ServicesModule } from '../services/services.module';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [ ServicesModule ],
  providers: [ AuthGateway, UsersGateway, RoomsGateway, RTCGateway, MessagesGateway ],
})
export class GatewaysModule {}
