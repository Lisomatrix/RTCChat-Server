import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { TokenService } from "./token.service";
import { UserService } from "./user.service";
import { RoomService } from "./room.service";
import { RTCService } from "./rtc.service";
import { MessageService } from "./message.service";


@Module({
    providers: [ DatabaseService, TokenService, UserService, RoomService, RTCService, MessageService ],
    exports: [ DatabaseService, TokenService, UserService, RoomService, RTCService, MessageService ]
})
export class ServicesModule {}