import { Client } from 'socket.io';
import { User } from './user';

export interface IClient extends Client {
    user?: User;
}
