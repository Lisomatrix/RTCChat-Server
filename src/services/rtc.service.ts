import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as uuid from 'uuid/v1';

export interface ICall {
    id: string;
    callerId: string;
    callerSocketId: string;
    receiverId: string;
    receiverSocketId?: string;
}

interface CallUserIds {
    callerId: string;
    receiverId: string;
}

@Injectable()
export class RTCService {

    private collection = 'calls';

    constructor(private databaseService: DatabaseService) {}

    public async createCall(userIds: CallUserIds, socketId: string) {
        const newCall: ICall = {
            id: uuid(),
            callerId: userIds.callerId,
            callerSocketId: socketId,
            receiverId: userIds.receiverId,
        };

        await this.databaseService.insertDocument(this.collection, newCall);

        return newCall;
    }

    public async deleteCall(callId: string) {
        await this.databaseService.deleteDocumentByQuery(this.collection, { id: callId });
    }

    public async findCallById(callId: string) {
        return await this.databaseService.findDocument(this.collection, { id: callId }) as ICall;
    }
}
