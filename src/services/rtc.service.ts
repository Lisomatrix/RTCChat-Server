import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as uuid from 'uuid/v1';

export interface ICall {
    _id?: any;
    id: string;
    callerId: string;
    callerSocketId: string;
    receiverId: string;
    receiverSocketId?: string;
    startTime?: number;
}

interface CallUserIds {
    callerId: string;
    receiverId: string;
}

@Injectable()
export class RTCService {

    private logger = new Logger(RTCService.name);

    private collection = 'calls';

    constructor(private databaseService: DatabaseService) {
        this.deleteExpiredCalls().then();
    }

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
        const call = await this.databaseService.findDocument(this.collection, { id: callId }) as ICall;

        delete call._id;

        return call;
    }

    public async findCalls() {
        return (await (await this.databaseService.findDocuments(this.collection, {})).toArray()) as ICall[];
    }

    private async deleteExpiredCalls() {
        setInterval(async () => {
            const calls = await this.findExpiredCalls();
            const ids = [];

            calls.forEach(call => ids.push(call.id));

            this.logger.log('Deleting ' + ids.length + ' expired calls!');

            await this.databaseService.deleteDocumentsByQuery(this.collection, { id: { $in: ids }});
        }, 1800000);
    }

    private async findExpiredCalls() {
        const calls = await this.findCalls();

        const expiredCalls = new Array<ICall>();

        const currentTime = Date.now();

        calls.forEach(call => {

            if (!call.startTime) {
                return;
            }

            // From milliseconds to seconds
            const timeDiff = Math.round((currentTime - call.startTime) / 1000);

            // If the time difference is equal or bigger than 24 hours
            if (timeDiff >= 86400) {
                expiredCalls.push(call);
            }
        });

        return expiredCalls;
    }
}
