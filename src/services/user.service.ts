import { Injectable } from '@nestjs/common';
import { User } from 'src/models/user';
import * as uuid from 'uuid/v1';
import { Cursor } from 'mongodb';
import { DatabaseService } from './database.service';

@Injectable()
export class UserService {

    private collection = 'users';

    constructor(private databaseService: DatabaseService) {

    }

    public async createUser(name: string, password: string): Promise<User> {
        const newUser: User = {
            id: uuid(),
            name,
            password
        };

        await this.databaseService.insertDocument(this.collection, newUser)

        return newUser;
    }

    public async findByName(name: string): Promise<User | null> {
        const foundUser = await this.databaseService.findDocument(this.collection, { name }) as User;

        return foundUser;
    }

    public async findBySessionId(sessionId: string): Promise<User | null> {

        return await this.databaseService.findDocument(this.collection, { sessionId }) as User;
    }

    public async findById(id: string): Promise<User | null> {
        const foundUser = await this.databaseService.findDocument(this.collection, { id }) as User;

        return foundUser;
    }

    public async findAll(): Promise<Cursor<User>> {
        return await this.databaseService.findDocuments(this.collection, {});
    }

    public async setSessionId(id: string, sessionId: string) {
        const user = await this.databaseService.findDocument(this.collection, { id }) as User;

        if (user) {
            user.sessionId = sessionId;
            await this.databaseService.replaceDocument(this.collection, { id }, user);
        }
    }

    public async removeSessionId(id: string) {
        const user = await this.databaseService.findDocument(this.collection, { id }) as User;

        if (user) {
            user.sessionId = '';
            await this.databaseService.replaceDocument(this.collection, { id }, user);
        }
    }

    public async findSessionIdByUserId(id: string) {
        const user = await this.databaseService.findDocument(this.collection, { id }) as User;

        return user.sessionId;
    }
}