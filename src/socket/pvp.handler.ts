import { Namespace, Socket } from 'socket.io';
import { pvpSocketController } from '../controllers/pvp.controller';
import { JoinRoomDto } from '../dto/join-room.dto';
import { SocketEventCallback } from '../types/socket-event-callback.type';

export const pvpSocketHandler = (io: Namespace) => (socket: Socket) => {
    socket.on('join_random', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            pvpSocketController.joinRoomRandom(io, socket, data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('create', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            pvpSocketController.createRoom(io, socket, data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('join', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            pvpSocketController.joinRoom(io, socket, data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });
};
