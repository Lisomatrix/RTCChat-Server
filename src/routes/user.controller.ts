import { Controller, Get } from "@nestjs/common";
import { UserService } from "src/services/user.service";


@Controller('/user')
export class UserController {

    constructor(private userService: UserService) {

    }

    @Get('/')
    private async getUsers() {
        const users = await this.userService.findAll();

        await users.forEach(user => {
            delete user.password;
            delete user.sessionId
        });

        return users;
    }
}