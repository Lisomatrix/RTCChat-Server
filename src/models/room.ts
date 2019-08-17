import { User } from './user';

export interface Room {
    id: string;
    members: User[];
    name: string;
}
