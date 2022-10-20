import { GameController } from '../controllers/game.controller';

interface Player {
    socketId: string;
    name: string;
}

export interface Room {
    game: GameController;
    x?: Player;
    o?: Player;
}
