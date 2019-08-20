import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

export interface IMessage {
    _id?: any;
    authorId: string;
    destinyId: string;
    message: any;
    sent?: boolean;
    sentAt?: number;
}

@Injectable()
export class MessageService {

    private collection = 'messages';

    constructor(private databaseService: DatabaseService) {

    }

    public async addMessage(message: IMessage) {
        await this.databaseService.insertDocument(this.collection, message);
    }

    public async findUnreadMessages(userId: string) {
        let messages = await (await this.databaseService.findDocuments(this.collection, { destinyId: userId })).toArray();

        messages = this.removeDbId(messages);

        return messages;
    }

    public async findAllMessages(userId: string) {
        let messages = await (await this.databaseService.findDocuments(this.collection, {
            $or: [
                { destinyId: userId },
                { authorId: userId },
            ],
        })).toArray();

        messages = this.removeDbId(messages);

        return messages;
    }

    private removeDbId(messages: IMessage[]) {
        for (let i = 0, n = messages.length; i < n; i++) {
            delete messages[i]._id;
        }

        return messages;
    }
}
