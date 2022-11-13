import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { pveSocketHandler } from './socket/pve.handler';
import { pvpSocketHandler } from './socket/pvp.handler';

process.on('uncaughtException', (err: Error) => {
    console.error(err);
});

const server = createServer(app);

const io = new Server(server);
io.of('/pvp', pvpSocketHandler(io.of('/pvp')));
io.of('/pve', pveSocketHandler(io.of('/pve')));

server.listen(process.env.PORT, () => {
    console.log('Server listening on http://localhost:' + process.env.PORT);
});
