import { Injectable } from "@nestjs/common";
import * as uuid from 'uuid/v1';
import { UserService } from "dist/src/services/user.service";

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

    constructor(private userService: UserService) {

    }

    public async authenticate(authenticationData: IAuthentication) {
        const foundUser = await this.userService.findByName(authenticationData.username);
        
        if (foundUser && foundUser.password === authenticationData.password) {
            const token = this.generateToken(foundUser.id);

            return token;
        }

        return false;
    }

    public generateToken(userId: string) {

        const token: IToken = {
            token: uuid(),
            userId
        };

        this.tokens.push(token);

        return token;
    }

    public getUserId(token: string): string | null {

        for (var i = 0, n = token.length; i < n; i++) {
            if (this.tokens[i] && this.tokens[i].token === token) {
                return this.tokens[i].userId;
            }            
        }

        return null;
    }
}