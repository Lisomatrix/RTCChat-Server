import { Controller, Post, Body, HttpException } from "@nestjs/common";
import { UserService } from "src/services/user.service";
import { TokenService, IAuthentication } from "src/services/token.service";


@Controller('/auth')
export class AuthController {

  constructor(private tokenService: TokenService, private userService: UserService) {

  }

  @Post('/')
  private async authenticate(@Body() authentication: IAuthentication): Promise<boolean | Object> {

    const token = await this.tokenService.authenticate(authentication);

    if (token) return token;
    
    throw new HttpException('Invalid username or password!', 400);
  }

  @Post('/register')
  private async register(@Body() register: IAuthentication): Promise<boolean | Object> {

    const user = await this.userService.findByName(register.username);

    if (user) {
      throw new HttpException('Username already exists!', 400);
    }
    
    await this.userService.createUser(register.username, register.password);
    
    const token = await this.tokenService.authenticate(register);

    return token;
  }
}