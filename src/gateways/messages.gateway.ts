import { WebSocketGateway, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";
import { AuthGuard } from "src/guards/websocket.guard";
import { UseGuards } from "@nestjs/common";
import { UserService } from "dist/src/services/user.service";
import { Client, Server } from "socket.io";
import { IMessage, MessageService } from "src/services/message.service";

@UseGuards(AuthGuard)
@WebSocketGateway()
export class MessagesGateway {

    @WebSocketServer()
    private server: Server;

    constructor(private messagesService: MessageService, private userService: UserService) {

    }

    @SubscribeMessage('new_message')
    private async handleSendMessage(client: Client, data: string) {
        const message = JSON.parse(data) as IMessage;

        const user = await this.userService.findById(message.destinyId);

        if (user.sessionId && user.sessionId.trim() !== '') {
            this.server.to(user.sessionId).emit('message', message);

            message.sent = true;
        }

        if (!message.sent) {
            message.sent = false;
        }

        await this.messagesService.addMessage(message);
    }

    @SubscribeMessage('get_new_messages')
    private async handleGetUnreadMessages(client: Client) {
        
        const user = await this.userService.findBySessionId(client.id);

        return await this.messagesService.findUnreadMessages(user.id);
    }

    @SubscribeMessage('get_messages')
    private async handleGetMessages(client: Client) {
        const user = await this.userService.findBySessionId(client.id);

        return await this.messagesService.findAllMessages(user.id);
    }
}