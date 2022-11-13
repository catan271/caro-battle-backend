import { Role } from '../types/role.type';

export interface MoveDto {
    room: number;
    player: Role;
    row: number;
    col: number;
}
