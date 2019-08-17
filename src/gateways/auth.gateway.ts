import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { WsResponse, WebSocketGateway, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Client } from 'socket.io';

@WebSocketGateway()
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

    async handleDisconnect(client: Client) {
        try {
          const userId = await this.tokenService.getUserId(
            client.request.connection.parser.incoming._query.token,
          );

          await this.userService.removeSessionId(userId);
        // tslint:disable-next-line: no-empty
        } catch (ex) { }
      }

    async handleConnection(client: Client, ...args: any[]) {
        const token = client.request._query.token;

        if (!token) {
            client.sockets[client.conn.id].disconnect();
        }

        const userId = await  this.tokenService.getUserId(token);

        await this.userService.setSessionId(userId, client.id);

        client.server.sockets.sockets[client.id].join(userId);
    }

    constructor(private tokenService: TokenService, private userService: UserService) {

    }

    @SubscribeMessage('authenticate')
    async authenticate(client: Client, receivedData: string): Promise<WsResponse<any>> {
        const userId = await this.tokenService.getUserId(receivedData);

        await this.userService.setSessionId(userId, client.id);

        return { event: 'authentication', data: { authenticated: true } };
    }
}
