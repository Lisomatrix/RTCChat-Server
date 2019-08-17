import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsResponse } from '@nestjs/websockets';
import { AuthGuard } from '../guards/websocket.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Client, Server } from 'socket.io';
import { IMessage, MessageService } from '../services/message.service';

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

        message.sentAt = Date.now();

        if (message.authorId !== message.destinyId) {
            this.server.to(message.authorId).emit('message', message);
        }

        this.server.to(message.destinyId).emit('message', message);

        message.sent = true;

        await this.messagesService.addMessage(message);
    }

    @SubscribeMessage('get_new_messages')
    private async handleGetUnreadMessages(client: Client): Promise<WsResponse<any[]>> {

        const user = await this.userService.findBySessionId(client.id);

        const messages = await (await this.messagesService.findUnreadMessages(user.id)).toArray();

        return { event: 'get_new_messages', data: messages };
    }

    @SubscribeMessage('get_messages')
    private async handleGetMessages(client: Client) {
        const user = await this.userService.findBySessionId(client.id);

        const messages = await (await this.messagesService.findAllMessages(user.id)).toArray();

        return { event: 'get_messages', data: messages };
    }
}
