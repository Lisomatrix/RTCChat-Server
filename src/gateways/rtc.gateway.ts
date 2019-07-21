import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsResponse } from "@nestjs/websockets";
import { Server, Client } from "socket.io";
import { RoomService } from "src/services/room.service";
import { UserService } from "src/services/user.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/websocket.guard";

@UseGuards(AuthGuard)
@WebSocketGateway()
export class RTCGateway {

    @WebSocketServer()
    private server: Server;

    constructor(private roomService: RoomService, private userService: UserService) {
        
    }

    @SubscribeMessage('send_offer')
    private async handleSendOffer(client: Client, receivedData: string): Promise<WsResponse<any>> {
        const user = await this.userService.findBySessionId(client.id);
        const member = await this.roomService.getRoomMember(user);

        this.server.to(member.sessionId).emit('receive_offer', receivedData);

        return { event: 'offer_sent', data: undefined };
    }

    @SubscribeMessage('send_answer')
    private async handleSendAnswer(client: Client, receivedData: string): Promise<WsResponse<any>> {
        const user = await this.userService.findBySessionId(client.id);
        const member = await this.roomService.getRoomMember(user);

        this.server.to(member.sessionId).emit('receive_answer', receivedData);

        return { event: 'answer_sent', data: undefined };
    }

    @SubscribeMessage('send_ice')
    private async handleSendIce(client: Client, receivedData: string): Promise<WsResponse<any>> {
        const user = await this.userService.findBySessionId(client.id);
        const member = await this.roomService.getRoomMember(user);

        this.server.to(member.sessionId).emit('receive_ice', receivedData);

        return { event: 'ice_sent', data: undefined };
    }
}