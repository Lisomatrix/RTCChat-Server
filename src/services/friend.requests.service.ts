import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { FriendRequest } from '../models/friend.request';
import * as uuid from 'uuid/v1';
import { UserService } from './user.service';

@Injectable()
export class FriendRequestService {

    private collection = 'friend_requests';

    constructor(private databaseService: DatabaseService, private userService: UserService) {}

    public async createFriendRequest(targetUserId: string, sourceUserId: string) {
        const request: FriendRequest = {
            id: uuid(),
            sourceUserId,
            targetUserId,
            date: Date.now(),
        };

        await this.databaseService.insertDocument(this.collection, request);
    }

    public async findFriendRequests(userId: string) {
        return await (await this.databaseService.findDocuments(this.collection, { targetUserId: userId })).toArray();
    }

    public async acceptFriendRequest(requestId: string) {
        const request = await this.databaseService.findDocument(this.collection, { id: requestId }) as FriendRequest;

        if (!request) {
            return;
        }

        await this.userService.addFriend(request.sourceUserId, request.targetUserId);

        await this.databaseService.deleteDocumentByQuery(this.collection, { id: request.id });
    }

    public async refuseFriendRequest(requestId: string) {
        const request = await this.databaseService.findDocument(this.collection, { id: requestId }) as FriendRequest;

        if (!request) {
            return;
        }

        await this.databaseService.deleteDocumentByQuery(this.collection, { id: request.id });
    }
}
