import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private tokenService: TokenService, private userService: UserService) {

  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const token = context.switchToWs().getClient().handshake.query.token;

    if (!token) {
        return false;
    }

    const userId = await this.tokenService.getUserId(token);

    if (!userId) {
        return false;
    }

    return true;
  }
}
