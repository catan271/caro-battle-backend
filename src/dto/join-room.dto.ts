import { Role } from '../types/role.type';

export interface JoinRoomDto {
    name: string;
    room?: number;
    role?: Role;
    time?: number;
}
