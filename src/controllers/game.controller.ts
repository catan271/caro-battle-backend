export class GameController {
    map: Array<Array<string>>;
    turn: 'x' | 'o';
    status: 'waiting' | 'waiting-lock' | 'in-game' | 'endgame';

    constructor() {
        this.map = [...Array(15)].map(() => {
            return [...Array(15)].map(() => null);
        });
        this.turn = 'x';
        this.status = 'waiting';
    }

    start() {
        this.status = 'in-game';
        this.turn = 'x';
    }

    move(player: 'x' | 'o', row: number, col: number) {
        if (this.turn !== player) {
            throw new Error('Invalid turn');
        }

        if (row < 0 || row >= 15 || col < 0 || row >= 15 || this.map[row][col]) {
            throw new Error('Invalid move');
        }

        this.map[row][col] = player;

        this.turn = player === 'x' ? 'o' : 'x';
    }
}
