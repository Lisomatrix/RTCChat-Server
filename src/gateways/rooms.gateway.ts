import { WebSocketGateway, SubscribeMessage, WsResponse, WsException, WebSocketServer } from '@nestjs/websockets';
import { Client, Server } from 'socket.io';
import { RoomService } from './../services/room.service';
import { UserService } from './../services/user.service';
import { isNull } from 'util';
import { Observable, Observer } from 'rxjs';
import { Room } from 'src/models/room';
import { AuthGuard } from 'src/guards/websocket.guard';
import { UseGuards } from '@nestjs/common';

interface NewRoom {
    name: string;
}

interface JoinRoom {
    id: string;
}

@UseGuards(AuthGuard)
@WebSocketGateway()
export class RoomsGateway {

    @WebSocketServer()
    server: Server;

    constructor(private roomService: RoomService, private useService: UserService) {
        
    }

    @SubscribeMessage('new_room')
    private async handleNewRoom(client: Client, receivedData: string): Promise<WsResponse<any>> {
        const newRoomData = JSON.parse(receivedData) as NewRoom;
        const user = await this.useService.findBySessionId(client.id);
        
        if (!isNull(user)) {
            this.roomService.createRoom(newRoomData.name, user);

            return { event: 'room_created', data: { } };
        }

        throw new WsException('Invalid credentials.');
    }

    @SubscribeMessage('rooms')
    private async handleRoomList(client: Client): Promise<Observable<WsResponse<Room>>> {
        return Observable.create((obs: Observer<WsResponse<Room>>) => {
            this.roomService.getRooms().subscribe((room: Room) =>
                obs.next({ event: 'new_room', data: room }));
        });
    }

    @SubscribeMessage('join_room')
    private async handleRoomJoin(client: Client, receivedData: string) {
        const data = JSON.parse(receivedData) as JoinRoom;
        const user = await this.useService.findBySessionId(client.id);
        console.log(client.id);
        if (!isNull(user)) {
            const room = this.roomService.joinRoom(data.id, user, this.server);

            return { event: 'room_joined', data: room };
        }

        throw new WsException('Invalid credentials.');
    }
}
