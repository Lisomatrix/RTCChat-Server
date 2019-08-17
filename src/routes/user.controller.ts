import { Controller, Get, Post, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('/user')
export class UserController {

    constructor(private userService: UserService) {

    }

    @Get('/')
    private async getUsers() {
        const users = await (await this.userService.findAll()).toArray();

        users.forEach(user => {
            delete user.password;
            delete user.sessionId;
        });

        return users;
    }
}
