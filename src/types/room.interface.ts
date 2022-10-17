import { GameController } from '../controllers/game.controller';

interface Player {
    socketId: string;
    name: string;
    role: 'x' | 'o';
}

export interface Room {
    game: GameController;
    x?: Player;
    o?: Player;
}
