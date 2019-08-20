import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsResponse } from '@nestjs/websockets';
import { Server, Client } from 'socket.io';
import { RoomService } from '../services/room.service';
import { UserService } from '../services/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/websocket.guard';
import { RTCService } from '../services/rtc.service';
import { IClient } from 'src/models/client';

export interface RTCData {
    userId: string;
    data?: any;
    sender?: string;
}

interface CallResponse {
    callId: string;
}

@UseGuards(AuthGuard)
@WebSocketGateway()
export class RTCGateway {

    @WebSocketServer()
    private server: Server;

    constructor(private roomService: RoomService, private userService: UserService, private rtcService: RTCService) {

    }

    @SubscribeMessage('refuse_call')
    private async handleRefuseCallRequest(client: IClient, refuseCallJSON: string): Promise<WsResponse<any>> {
        const data = JSON.parse(refuseCallJSON) as CallResponse;

        const call = await this.rtcService.findCallById(data.callId);

        this.server.to(call.callerSocketId).emit('call_refused');

        await this.rtcService.deleteCall(data.callId);

        return { event: 'call_refused', data: undefined };
    }

    @SubscribeMessage('accept_call')
    private async handleAcceptCallRequest(client: IClient, acceptCallJSON: string): Promise<WsResponse<any>> {
        const data = JSON.parse(acceptCallJSON) as CallResponse;

        const call = await this.rtcService.findCallById(data.callId);

        if (call.receiverSocketId) {
            return { event: 'call_error', data: { error: 'Call already accepted by another device!' } };
        }

        call.receiverSocketId = client.id;

        this.server.to(call.callerSocketId).emit('call_accepted');

        return { event: 'accepted', data: undefined };
    }

    @SubscribeMessage('start_call')
    private async handleStartCallRequest(client: IClient, dataJSON: string): Promise<WsResponse<any>> {
        const data = JSON.parse(dataJSON) as RTCData;

        const user = client.user;

        let isFriend = false;

        for (let i = 0, n = user.friends.length; i < n; i++) {
            if (user.friends[i] === data.userId) {
                isFriend = true;
                break;
            }
        }

        const call = await this.rtcService.createCall({ callerId: user.id, receiverId: data.userId }, client.id);

        if (isFriend) {
            this.server.to(data.userId).emit('start_call', call);
            return { event: 'call_started', data: call };
        } else {
            return { event: 'call_error', data: { error: 'User is not your friend!' } };
        }
    }

    @SubscribeMessage('send_offer')
    private async handleSendOffer(client: IClient, receivedData: string): Promise<WsResponse<any>> {
        const rtcData = JSON.parse(receivedData) as RTCData;

        this.server.to(rtcData.userId).emit('receive_offer', { userId: rtcData.sender, data: rtcData.data });

        return { event: 'offer_sent', data: undefined };
    }

    @SubscribeMessage('send_answer')
    private async handleSendAnswer(client: IClient, receivedData: string): Promise<WsResponse<any>> {
        const rtcData = JSON.parse(receivedData) as RTCData;

        this.server.to(rtcData.userId).emit('receive_answer', rtcData.data);

        return { event: 'answer_sent', data: undefined };
    }

    @SubscribeMessage('send_ice')
    private async handleSendIce(client: IClient, receivedData: string): Promise<WsResponse<any>> {
        const rtcData = JSON.parse(receivedData) as RTCData;

        this.server.to(rtcData.userId).emit('receive_ice', rtcData.data);

        return { event: 'ice_sent', data: undefined };
    }
}
