import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { UsersGateway } from './users.gateway';
import { RTCGateway } from './rtc.gateway';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { RTCService } from '../services/rtc.service';
import { TokenService } from 'src/services/token.service';
import { DatabaseService } from 'src/services/database.service';
import { ServicesModule } from 'src/services/services.module';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [ ServicesModule ],
  providers: [ UsersGateway, RoomsGateway, RTCGateway, MessagesGateway ],
})
export class GatewaysModule {}