export class GameController {
    map: Array<Array<string>>;
    turn: 'x' | 'o';
    status: 'waiting' | 'in-game' | 'endgame';

    constructor() {
        this.map = [...Array(15)].map(() => {
            return [...Array(15)].map(() => null);
        });
        this.turn = 'x';
        this.status = 'waiting';
    }

    start() {
        this.status = 'in-game';
    }
}
