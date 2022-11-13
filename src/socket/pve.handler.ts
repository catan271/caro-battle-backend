import { Namespace, Socket } from 'socket.io';
import { MoveDto } from '../dto/move.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { SocketEventCallback } from '../types/socket-event-callback.type';
import { PveSocketController } from '../controllers/pve.controller';

export const pveSocketHandler = (io: Namespace) => (socket: Socket) => {
    const controller = new PveSocketController(io, socket);

    socket.on('join', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            controller.join(data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('move', (data: MoveDto, callback: SocketEventCallback) => {
        try {
            controller.move(data);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('disconnect', () => {
        try {
            controller.leave();
        } catch (err) {
            console.error(err);
        }
    });
};
