import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  WsException,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets";
import { UserService } from "src/services/user.service";
import { User } from "src/models/user";
import { Client } from "socket.io";
import { TokenService } from "src/services/token.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/websocket.guard";

interface NewUser {
  name: string;
  password: string;
}

interface Authenticate {
  name: string;
  password: string;
}

@UseGuards(AuthGuard)
@WebSocketGateway()
export class UsersGateway implements OnGatewayDisconnect {
  constructor(
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  async handleDisconnect(client: Client) {
    try {
      const userId = this.tokenService.getUserId(
        client.request.connection.parser.incoming._query.token
      );

      await this.userService.removeSessionId(userId);
    } catch (ex) {}
  }

  @SubscribeMessage('authenticate')
  async authenticate(client: Client, receivedData: string): Promise<WsResponse<any>>{

    const userId = this.tokenService.getUserId(receivedData);

    await this.userService.setSessionId(userId, client.id);

    return { event: 'authentication', data: null };
  }

  @SubscribeMessage("new_user")
  async handleNewUser(
    client: Client,
    receivedData: string
  ): Promise<WsResponse<User>> {
    const data = JSON.parse(receivedData) as NewUser;
    const user = await this.userService.createUser(data.name, data.password);

    return { event: "new_user", data: user };
  }

  async handleLoginUser(client: Client, token: string) {
    const userId = this.tokenService.getUserId(token);

    const user = await this.userService.findById(userId);

    this.userService.setSessionId(user.id, client.id);

    if (user) {
      return { event: "authenticated" };
    }

    throw new WsException("User not found!");
  }
}
