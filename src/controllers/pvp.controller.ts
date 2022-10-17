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

    joinRoomRandom(io: Namespace, socket: Socket, data: JoinRoomDto, callback: SocketEventCallback) {
        let currentRoom: Room;
        let role: 'x' | 'o';
        let room = 1000;

        // find waiting room
        while (this.rooms[room]) {
            currentRoom = this.rooms[room];
            if (currentRoom.game.status === 'waiting') {
                role = this.checkRoom(room);
                if (role) break;
            }
            room++;
        }

        // create room if there is no waiting room
        if (!this.rooms[room]) {
            this.rooms[room] = {
                game: new GameController(),
            };
            currentRoom = this.rooms[room];
            role = 'x';
        }

        // set player of current room
        currentRoom[role] = {
            socketId: socket.id,
            name: data.name,
            role,
        };

        // socket join and callback
        socket.join(String(room));
        callback(null, {
            room,
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

    createRoom(io: Namespace, socket: Socket, data: JoinRoomDto, callback: SocketEventCallback) {
        let room = 1000;
        while (this.rooms[room]) {
            room++;
        }

        // create room
        this.rooms[room] = {
            game: new GameController(),
        };
        const currentRoom = this.rooms[room];
        const role = 'x';
        currentRoom.game.status = 'waiting-lock';

        // set player of current room
        currentRoom[role] = {
            socketId: socket.id,
            name: data.name,
            role,
        };

        // socket join and callback
        socket.join(String(room));
        callback(null, {
            room,
            role,
            status: currentRoom.game.status,
            map: currentRoom.game.map,
        });
    }

    joinRoom(io: Namespace, socket: Socket, data: JoinRoomDto, callback: SocketEventCallback) {
        const room = data.room;
        const role = this.checkRoom(room);

        if (!role) {
            throw new Error('Cannot join this room');
        }

        const currentRoom = this.rooms[room];

        // set player of current room
        currentRoom[role] = {
            socketId: socket.id,
            name: data.name,
            role,
        };

        // socket join and callback
        socket.join(String(room));
        callback(null, {
            room,
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

    spectate(io: Namespace, socket: Socket, data: JoinRoomDto, callback: SocketEventCallback) {
        if (!data.room) {
            throw new Error('Room must be provided');
        }

        const { room } = data;
        let currentRoom: Room;
        if (this.rooms[room]) {
            currentRoom = this.rooms[room];
        } else {
            this.rooms[room] = {
                game: new GameController(),
            };
        }

        // socket join and callback
        socket.join(String(room));
        callback(null, {
            room,
            role: 'spectator',
            status: currentRoom.game.status,
            map: currentRoom.game.map,
        });
    }

    leave(io: Namespace, socket: Socket) {
        for (const room in this.rooms) {
            // delete player
            if (this.rooms[room].x?.socketId === socket.id) {
                delete this.rooms[room]?.x;
            }

            // delete player
            if (this.rooms[room].o?.socketId === socket.id) {
                delete this.rooms[room]?.o;
            }

            this.rooms[room].game.status = 'waiting-lock';

            // delete room if there no one left in room
            if (!io.adapter.rooms.get(room)?.size) {
                delete this.rooms[room];
            }
        }
    }
}

export const pvpSocketController = new PvpSocketController();
