import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { Client } from 'socket.io';
import { IClient } from 'src/models/client';

@Injectable()
export class AuthGuard implements CanActivate {

  private logger = new Logger(AuthGuard.name);

  constructor(private tokenService: TokenService, private userService: UserService) {

  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const client = context.switchToWs().getClient() as IClient;

    if (client.user) {
      return true;
    } else {
      const token = context.switchToWs().getClient().handshake.query.token;

      const user = await this.getUser(token);

      if (user) {
        client.user = user;
        return true;
      }

      return false;
    }
  }

  private async getUser(token: string) {
    if (!token) {
      return false;
    }

    const userId = await this.tokenService.getUserId(token);

    if (!userId) {
      return false;
    }

    const user = await this.userService.findById(userId);

    return user;
  }
}
