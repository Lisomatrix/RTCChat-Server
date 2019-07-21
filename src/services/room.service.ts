import { Injectable } from '@nestjs/common';
import { Room } from 'src/models/room';
import * as uuid from 'uuid/v1';
import { User } from 'src/models/user';
import { Subject, Observable } from 'rxjs';
import { WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserService } from 'src/services/user.service';
import { DatabaseService } from './database.service';

@Injectable()
export class RoomService {

    @WebSocketServer()
    server: Server;

    private rooms = new Array<Room>();
    private roomSubject = new Subject<Room>();

    private collection = 'rooms';

    constructor(private databaseService: DatabaseService, private userService: UserService) {
        
    }

    public async getRoomMember(user: User) {

        const room = await this.databaseService.findDocument(this.collection, { "members.id": user.id }) as Room;

        if (room.members[0].id === user.id) {
            return room.members[1];
        } else if (room.members[1].id === user.id) {
            return room.members[0];
        }

        return undefined;
    }

    public async joinRoom(roomId: string, user: User, server: Server): Promise<Room> {
        const room = await this.findById(roomId);

        server.to(room.members[0].sessionId)
            .emit('user_joined');

        room.members.push(user);
        
        await this.databaseService.replaceDocument(this.collection, { id: room.id }, room);

        return room;
    }

    public async createRoom(name: string, user: User): Promise<Room> { 

        const newRoom: Room = {
            id: uuid(),
            name,
            members: [user]
        };

        await this.databaseService.insertDocument(this.collection, newRoom);

        this.rooms.push(newRoom);
        this.roomSubject.next(newRoom);
        
        return newRoom;
    }

    public async findById(id: string): Promise<Room | null> {

        return await this.databaseService.findDocument(this.collection, { id });
    }

    public getRooms(): Observable<Room> {
        return this.roomSubject.asObservable();
    }
}