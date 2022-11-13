import { Namespace, Socket } from 'socket.io';
import { MoveDto } from '../dto/move.dto';
import { getRoomData, getTurnData } from '../utils/room-data.util';
import { JoinRoomDto } from '../dto/join-room.dto';
import { Room } from '../types/room.interface';
import { SocketEventCallback } from '../types/socket-event-callback.type';
import { GameController } from './game.controller';
import { Role } from '../types/role.type';
import { EndgameDto } from '../dto/endgame.dto';

export class PvpSocketController {
    Class = PvpSocketController;
    static rooms: Record<number, Room> = {};
    io: Namespace;
    socket: Socket;

    constructor(io: Namespace, socket: Socket) {
        this.io = io;
        this.socket = socket;
    }

    checkRoom(room: number) {
        if (!this.Class.rooms[room]) {
            return null;
        }
        if (!this.Class.rooms[room].x) {
            return 'x';
        }
        if (!this.Class.rooms[room].o) {
            return 'o';
        }
        return null;
    }

    endgame(room: number) {
        return (data: EndgameDto) => {
            this.io.to(String(room)).emit('endgame', data);
        };
    }

    joinRoomRandom(data: JoinRoomDto, callback: SocketEventCallback) {
        let currentRoom: Room;
        let role: Role;
        let room: number;

        // find waiting room
        for (const key in this.Class.rooms) {
            room = Number(key);
            currentRoom = this.Class.rooms[room];
            if (currentRoom.game.status === 'waiting') {
                role = this.checkRoom(Number(room));
                if (role) break;
            }
        }

        // find unoccupied room
        if (!room || !role) {
            room = 1000;
            while (this.Class.rooms[room]) {
                room++;
            }
        }

        // create room if there is no waiting room
        if (!this.Class.rooms[room]) {
            this.Class.rooms[room] = {
                game: new GameController(60, this.endgame(room)),
            };
            currentRoom = this.Class.rooms[room];
            role = 'x';
        }

        // set player of current room
        currentRoom[role] = {
            socketId: this.socket.id,
            name: data.name,
        };

        // socket join and callback
        this.socket.join(String(room));
        this.io.to(String(room)).emit('player_join', getRoomData(currentRoom));
        callback(null, {
            you: role,
            room,
            time: currentRoom.game.time,
        });

        // start game if both x and o are present
        if (currentRoom.x && currentRoom.o) {
            currentRoom.game.start();

            this.io.to(String(room)).emit('turn', getTurnData(currentRoom));
        }
    }

    createRoom(data: JoinRoomDto, callback: SocketEventCallback) {
        let room = 1000;
        while (this.Class.rooms[room]) {
            room++;
        }

        // create room
        this.Class.rooms[room] = {
            game: new GameController(data.time || 60, this.endgame(room)),
        };
        const currentRoom = this.Class.rooms[room];
        const role = 'x';
        currentRoom.game.status = 'waiting-lock';

        // set player of current room
        currentRoom[role] = {
            socketId: this.socket.id,
            name: data.name,
        };

        // socket join and callback
        this.socket.join(String(room));
        this.io.to(String(room)).emit('player_join', getRoomData(currentRoom));
        callback(null, {
            you: role,
            room,
            time: currentRoom.game.time,
        });
    }

    joinRoom(data: JoinRoomDto, callback: SocketEventCallback) {
        const room = data.room;
        const role = this.checkRoom(room);

        if (!role) {
            throw new Error('Cannot join this room');
        }

        const currentRoom = this.Class.rooms[room];

        // set player of current room
        currentRoom[role] = {
            socketId: this.socket.id,
            name: data.name,
        };

        // socket join and callback
        this.socket.join(String(room));
        this.io.to(String(room)).emit('player_join', getRoomData(currentRoom));
        callback(null, {
            you: role,
            room,
            time: currentRoom.game.time,
        });

        // start game if both x and o are present
        if (currentRoom.x && currentRoom.o) {
            currentRoom.game.start();

            this.io.to(String(room)).emit('turn', getTurnData(currentRoom));
        }
    }

    move(data: MoveDto) {
        const room = this.Class.rooms[data.room];
        const { player, row, col } = data;

        if (!room) {
            throw new Error('Invalid room');
        }
        if (room[player]?.socketId !== this.socket.id) {
            throw new Error('Invalid player');
        }

        room.game.move(player, row, col);

        this.io.to(String(data.room)).emit(
            'turn',
            getTurnData(room, {
                player,
                col,
                row,
            }),
        );
    }

    spectate(data: JoinRoomDto, callback: SocketEventCallback) {
        if (!data.room) {
            throw new Error('Room must be provided');
        }

        const { room } = data;
        if (!this.Class.rooms[room]) {
            this.Class.rooms[room] = {
                game: new GameController(data.time || 60, this.endgame(room)),
            };
            this.Class.rooms[room].game.status = 'waiting-lock';
        }
        const currentRoom = this.Class.rooms[room];

        // socket join and callback
        this.socket.join(String(room));
        this.io.to(String(room)).emit('player_join', getRoomData(currentRoom));
        callback(null, {
            room,
            you: 'spectator',
            time: currentRoom.game.time,
        });
    }

    leave() {
        for (const room in this.Class.rooms) {
            const currentRoom = this.Class.rooms[room];

            // delete player
            if (currentRoom.x?.socketId === this.socket.id) {
                delete currentRoom.x;
                currentRoom.game.triggerEndgame({
                    winner: 'o',
                    winPattern: [],
                });
            }
            if (currentRoom.o?.socketId === this.socket.id) {
                delete currentRoom.o;
                currentRoom.game.triggerEndgame({
                    winner: 'x',
                    winPattern: [],
                });
            }

            // delete room if there no one left in room
            if (!this.io.adapter.rooms.get(room)?.size) {
                delete this.Class.rooms[room];
            }
        }
    }
}
