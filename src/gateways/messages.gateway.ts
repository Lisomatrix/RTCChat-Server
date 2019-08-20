import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsResponse } from '@nestjs/websockets';
import { AuthGuard } from '../guards/websocket.guard';
import { UseGuards, Logger } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Client, Server } from 'socket.io';
import { IMessage, MessageService } from '../services/message.service';
import { User } from 'src/models/user';
import { IClient } from 'src/models/client';

@UseGuards(AuthGuard)
@WebSocketGateway()
export class MessagesGateway {

    private logger = new Logger(MessagesGateway.name);

    @WebSocketServer()
    private server: Server;

    constructor(private messagesService: MessageService, private userService: UserService) {

    }

    @SubscribeMessage('new_message')
    private async handleSendMessage(client: IClient, data: string) {
        const message = JSON.parse(data) as IMessage;

        message.sentAt = Date.now();

        this.server.to(message.authorId).emit('message', message);
        this.server.to(message.destinyId).emit('message', message);

        message.sent = true;

        await this.messagesService.addMessage(message);
    }

    @SubscribeMessage('get_new_messages')
    private async handleGetUnreadMessages(client: IClient): Promise<WsResponse<any[]>> {
        const user = client.user;

        const messages = await this.messagesService.findUnreadMessages(user.id);

        return { event: 'get_new_messages', data: messages };
    }

    @SubscribeMessage('get_messages')
    private async handleGetMessages(client: IClient) {
        const user = client.user;

        const messages = await this.messagesService.findAllMessages(user.id);

        return { event: 'get_messages', data: messages };
    }
}
