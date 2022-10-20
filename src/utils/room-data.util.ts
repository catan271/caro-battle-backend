import { Room } from 'src/types/room.interface';

export const getRoomData = (room: Room) => {
    const res: any = {
        status: room.game?.status,
        map: room.game?.map,
        turn: room.game?.turn,
    };
    if (room.x) {
        res.x = {
            name: room.x.name,
        };
    }
    if (room.o) {
        res.o = {
            name: room.o.name,
        };
    }
    return res;
};

export const getTurnData = (room: Room, lastMove: any = {}) => {
    const turnData = getRoomData(room);

    if (lastMove) {
        turnData.lastMove = lastMove;
    }

    return turnData;
};
