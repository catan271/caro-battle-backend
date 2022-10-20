import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { pvpSocketHandler } from '.socket/pvp.handler';

process.on('uncaughtException', (err: Error) => {
    console.error(err);
});

const server = createServer(app);

const io = new Server(server);
io.of('/pvp', pvpSocketHandler(io.of('/pvp')));

server.listen(process.env.PORT, () => {
    console.log('Server listening on http://localhost:' + process.env.PORT);
});
