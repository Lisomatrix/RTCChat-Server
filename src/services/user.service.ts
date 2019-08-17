import { Injectable } from '@nestjs/common';
import { User } from '../models/user';
import * as uuid from 'uuid/v1';
import { Cursor } from 'mongodb';
import { DatabaseService } from './database.service';
import * as argon from 'argon2';

@Injectable()
export class UserService {

    private collection = 'users';

    constructor(private databaseService: DatabaseService) {
        // this.databaseService.isConnected().subscribe(isConnected => {
        //     if (isConnected) {
        //         this.databaseService.createIndex(this.collection, 'userId', 1, { unique: true }).then();
        //         this.databaseService.createIndex(this.collection, 'name', 1, { unique: true }).then();
        //     }
        // });
    }

    public deletePrivateUserData(user: User) {
        delete user.friends;
        delete user.password;
        delete user.sessionId;
    }

    public deletePrivateUsersData(users: User[]) {

        users.forEach(user => {
            delete user.friends;
            delete user.password;
            delete user.sessionId;
        });
    }

    public async createUser(name: string, password: string): Promise<User> {
        const newUser: User = {
            id: uuid(),
            name,
            password: await argon.hash(password),
            friends: [],
        };

        await this.databaseService.insertDocument(this.collection, newUser);

        return newUser;
    }

    public async addFriend(userId: string, friendUserId: string) {
        const user = await this.findById(userId);

        user.friends.push(friendUserId);

        await this.databaseService.replaceDocument(this.collection, { id: userId }, user);
    }

    public async findFriends(friends: string[]) {
        const foundUsers = await this.databaseService.findDocuments(this.collection, { friends: { $in: friends } });

        return foundUsers;
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

    public async updateUser(user: User) {
        await this.databaseService.replaceDocument(this.collection, { id: user.id }, user);
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

    public async searchByName(name: string) {
        const users = await (await this.databaseService.searchFromField(this.collection, 'name', name)).toArray() as User[];

        this.deletePrivateUsersData(users);

        return users;
    }
}
