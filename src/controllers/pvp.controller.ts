import { Namespace, Socket } from 'socket.io';
import { JoinRoomDto } from '../dto/join-room.dto';
import { Room } from '../types/room.interface';
import { SocketEventCallback } from '../types/socket-event-callback.type';
import { GameController } from './game.controller';

class PvpSocketController {
    rooms: Record<number, Room>;
    constructor() {
        this.rooms = {};
    }

    checkRoom(room: number) {
        if (!this.rooms[room]) {
            return null;
        }

        if (!this.rooms[room].x) {
            return 'x';
        }

        if (!this.rooms[room].o) {
            return 'o';
        }

        return null;
    }

    joinRoom(io: Namespace, socket: Socket, data: JoinRoomDto, callback: SocketEventCallback) {
        let currentRoom: Room;
        let role: 'x' | 'o';
        let room: number;

        if (data.room) {
            room = data.room;

            role = this.checkRoom(room);
            if (!role) {
                throw new Error('Cannot join this room');
            }

            currentRoom = this.rooms[room];
        } else {
            room = 999;
            // find waiting room
            while (this.rooms[room]) {
                room++;
                role = this.checkRoom(room);
                if (!role) continue;

                currentRoom = this.rooms[room];
            }

            // create room if there is no waiting room
            this.rooms[room] = {
                game: new GameController(),
            };
            currentRoom = this.rooms[room];
        }

        // set play of current room
        currentRoom[role] = {
            socketId: socket.id,
            name: data.name,
            role,
        };

        // socket join and callback
        socket.join(String(room));
        callback(null, {
            room: data.room,
            role,
            status: currentRoom.game.status,
            map: currentRoom.game.map,
        });

        // start game if both x and o are present
        if (currentRoom.x && currentRoom.o) {
            currentRoom.game.start();

            io.to(String(room)).emit('x-turn', {
                room: data.room,
                status: currentRoom.game.status,
                map: currentRoom.game.map,
            });
        }
    }
}

export const pvpSocketController = new PvpSocketController();
