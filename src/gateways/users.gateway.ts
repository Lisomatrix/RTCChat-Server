import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  WsException,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Client, Server } from 'socket.io';
import { TokenService } from '../services/token.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/websocket.guard';

interface NewFriendship {
  userId: string;
}

interface SearchUserQuery {
  userId?: string;
  name?: string;
}

interface ChangeName {
  name: string;
}

@UseGuards(AuthGuard)
@WebSocketGateway()
export class UsersGateway {

  @WebSocketServer()
  server: Server;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) { }

  @SubscribeMessage('change_username')
  private async handleChangeUsername(client: Client, changeNameJSON: string): Promise<WsResponse<any>> {
    const changeName = JSON.parse(changeNameJSON) as ChangeName;

    const user = await this.userService.findById((await this.userService.findBySessionId(client.id)).id);

    const foundUser = await this.userService.findByName(changeName.name);

    if (foundUser) {
      return { event: 'change_username', data: { success: false } };
    }

    user.name = changeName.name;

    this.userService.updateUser(user);

    return { event: 'change_username', data: { success: true } };
  }

  @SubscribeMessage('get_user')
  private async handleGetUser(client: Client): Promise<WsResponse<any>> {
    const user = await this.userService.findById((await this.userService.findBySessionId(client.id)).id);

    this.userService.deletePrivateUserData(user);

    return { event: 'get_user', data: user };
  }

  @SubscribeMessage('get_users')
  private async handleGetUsers(client: Client): Promise<WsResponse<any>> {
    const user = await this.userService.findById((await this.userService.findBySessionId(client.id)).id);

    const friends = await (await this.userService.findFriends(user.friends)).toArray();

    friends.forEach((friend: User) => {
      delete friend.password;
      delete friend.sessionId;
      delete friend.friends;
    });

    return { event: 'users', data: friends };
  }

  @SubscribeMessage('search_user')
  private async SearchUserByUsername(client: Client, userQueryJSON: string): Promise<WsResponse<any>> {
    const userQuery = JSON.parse(userQueryJSON) as SearchUserQuery;

    if (userQuery.userId) {
      const foundUser = await this.userService.findById(userQuery.userId);

      if (foundUser) {
        this.userService.deletePrivateUserData(foundUser);

        return { event: 'user_search', data: foundUser };
      }

    } else if (userQuery.name) {
      const foundUsers = await this.userService.searchByName(userQuery.name);

      if (foundUsers.length === 0) {
        return { event: 'user_search', data: { result: 'Not found! '}};
      }

      return { event: 'user_search', data: foundUsers };
    }

    return { event: 'user_search', data: { result: 'Not found! '}};
  }

  @SubscribeMessage('add_friendship')
  private async addFriendship(client: Client, friendShipJSON: string): Promise<WsResponse<any>> {
    const friendShip = JSON.parse(friendShipJSON) as NewFriendship;

    const user = await this.userService.findById((await this.userService.findBySessionId(client.id)).id);

    if (user.id === friendShip.userId) {
      return { event: 'data_error', data: { error: 'User trying to add is the same user that made the request!' } };
    }

    for (let i = 0, n = user.friends.length; i < n; i++) {
      if (user.friends[i] === friendShip.userId) {
        return { event: 'data_error', data: { error: 'User was already added!' } };
      }
    }

    await this.userService.addFriend(user.id, friendShip.userId);

    this.userService.deletePrivateUserData(user);

    this.server.to(friendShip.userId).emit( 'new_user', user );

    const friend = await this.userService.findById(friendShip.userId);

    this.userService.deletePrivateUserData(friend);

    return { event: 'new_user', data: friend };
  }
}
