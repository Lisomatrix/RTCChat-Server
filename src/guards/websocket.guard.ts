import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { TokenService } from "src/services/token.service";
import { cpus } from "os";
import { UserService } from "src/services/user.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private tokenService: TokenService, private userService: UserService) {

  }

  async canActivate(
    context: ExecutionContext
  ) {

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
