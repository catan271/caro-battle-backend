import { Namespace, Socket } from 'socket.io';
import { MoveDto } from '../dto/move.dto';
import { PvpSocketController } from '../controllers/pvp.controller';
import { JoinRoomDto } from '../dto/join-room.dto';
import { SocketEventCallback } from '../types/socket-event-callback.type';

let count = 1;
export const pvpSocketHandler = (io: Namespace) => (socket: Socket) => {
    console.log(count++);
    const controller = new PvpSocketController(io, socket);

    socket.on('join_random', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            controller.joinRoomRandom(data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('create', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            controller.createRoom(data, callback);
        } catch (err) {
            callback({
                message: err.message,
            });
        }
    });

    socket.on('join', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            controller.joinRoom(data, callback);
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

    socket.on('spectate', (data: JoinRoomDto, callback: SocketEventCallback) => {
        try {
            controller.spectate(data, callback);
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
