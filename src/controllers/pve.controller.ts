import { Namespace, Socket } from 'socket.io';
import { EndgameDto } from '../dto/endgame.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { MoveDto } from '../dto/move.dto';
import { Role } from '../types/role.type';
import { Room } from '../types/room.interface';
import { SocketEventCallback } from '../types/socket-event-callback.type';
import { getRoomData, getTurnData } from '../utils/room-data.util';
import { BotController } from './bot.controller';
import { GameController } from './game.controller';

export class PveSocketController {
    Class = PveSocketController;
    static rooms: Record<number, Room> = {};
    io: Namespace;
    socket: Socket;

    constructor(io: Namespace, socket: Socket) {
        this.io = io;
        this.socket = socket;
    }

    endgame(room: number) {
        return (data: EndgameDto) => {
            this.io.to(String(room)).emit('endgame', data);
        };
    }

    join(data: JoinRoomDto, callback: SocketEventCallback) {
        let room = 1000;
        let role = 'x';
        while (this.Class.rooms[room]) {
            room++;
        }

        this.Class.rooms[room] = {
            game: new GameController(null, this.endgame(room)),
        };
        const currentRoom = this.Class.rooms[room];
        currentRoom.game.start();

        if (data.role === 'x') {
            currentRoom.x = {
                socketId: this.socket.id,
                name: data.name,
            };
            currentRoom.o = {
                socketId: null,
                name: process.env.BOT_NAME,
            };
        } else {
            currentRoom.o = {
                socketId: this.socket.id,
                name: data.name,
            };
            currentRoom.x = {
                socketId: null,
                name: process.env.BOT_NAME,
            };
            role = 'o';

            const firstMove = BotController.firstMove();
            currentRoom.game.move('x', firstMove.row, firstMove.col);
        }

        this.socket.join(String(room));
        this.io.to(String(room)).emit('turn', getRoomData(currentRoom));
        callback(null, {
            you: role,
            room,
        });
    }

    move(data: MoveDto) {
        const room = this.Class.rooms[data.room];
        const { player } = data;
        let { row, col } = data;

        if (!room) {
            throw new Error('Invalid room');
        }
        if (room[player]?.socketId !== this.socket.id) {
            throw new Error('Invalid player');
        }

        room.game.move(player, row, col);

        if (room.game.status !== 'endgame') {
            const bot: Role = data.player === 'x' ? 'o' : 'x';
            const nextMove = BotController.generateMove(room.game.map, bot);
            row = nextMove.row;
            col = nextMove.col;
            room.game.move(bot, row, col);
        }

        this.io.to(String(data.room)).emit(
            'turn',
            getTurnData(room, {
                player,
                col,
                row,
            }),
        );
    }

    leave() {
        for (const room in this.Class.rooms) {
            const currentRoom = this.Class.rooms[room];

            // delete player
            if (currentRoom.x?.socketId === this.socket.id || currentRoom.o?.socketId === this.socket.id) {
                delete this.Class.rooms[room];
            }
        }
    }
}
