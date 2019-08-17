import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid/v1';
import { UserService } from './user.service';
import { RedisService } from './redis.service';
import * as argon from 'argon2';

interface IToken {
    token: string;
    userId: string;
}

export interface IAuthentication {
    username: string;
    password: string;
}

@Injectable()
export class TokenService {

    private tokens = new Array<IToken>();

    constructor(private userService: UserService, private redisService: RedisService) {

    }

    public async authenticate(authenticationData: IAuthentication) {
        const foundUser = await this.userService.findByName(authenticationData.username);

        if (foundUser && (await argon.verify(foundUser.password, authenticationData.password))) {
            const token = this.generateToken(foundUser.id);

            return token;
        }

        return false;
    }

    public generateToken(userId: string) {

        const token: IToken = {
            token: uuid(),
            userId,
        };

        this.redisService.setValue(token.token, userId);

        return token;
    }

    public async getUserId(token: string): Promise<string | null> {
        const userId = await this.redisService.getValue(token);

        return userId;
    }
}
