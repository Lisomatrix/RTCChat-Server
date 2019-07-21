import { Injectable } from "@nestjs/common";
import { DatabaseService } from "./database.service";

export interface IMessage {
    authorId: string;
    destinyId: string;
    message: any;
    sent?: boolean;
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
        return await this.databaseService.findDocuments(this.collection, { destinyId: userId });
    }

    public async findAllMessages(userId: string) {
        return await this.databaseService.findDocuments(this.collection, { destinyId: userId });
    }
}