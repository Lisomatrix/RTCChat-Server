import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { RoomService } from './room.service';
import { RTCService } from './rtc.service';
import { MessageService } from './message.service';
import { RedisService } from './redis.service';
import { ConfigModule } from '../config/config.module';
import { FriendRequestService } from './friend.requests.service'

@Module({
    imports: [ ConfigModule ],
    providers: [ FriendRequestService, RedisService, DatabaseService, TokenService, UserService, RoomService, RTCService, MessageService ],
    exports: [ FriendRequestService, RedisService, DatabaseService, TokenService, UserService, RoomService, RTCService, MessageService ],
})
export class ServicesModule {}
