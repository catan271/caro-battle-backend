export class GameController {
    map: Array<Array<string>>;
    turn: 'x' | 'o';
    status: 'waiting' | 'waiting-lock' | 'in-game' | 'endgame';

    constructor() {
        this.map = [...Array(15)].map(() => {
            return [...Array(15)].map(() => null);
        });
        this.turn = undefined;
        this.status = 'waiting';
    }

    start() {
        this.status = 'in-game';
        this.turn = this.turn || 'x';
    }

    getCell(r: number, c: number) {
        const row = this.map[r] || [];
        return row[c];
    }

    checkWinner(player: 'x' | 'o', r: number, c: number) {
        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
        ];

        for (const direction of directions) {
            const winPattern: string[] = [];
            for (let i = 0; i < 5; i++) {
                const row = r + i * direction[0];
                const col = c + i * direction[1];
                const cell = this.getCell(row, col);
                if (!cell || cell != player) break;
                winPattern.push(row + '-' + col);
            }
            for (let i = 1; i < 5; i++) {
                const row = r - i * direction[0];
                const col = c - i * direction[1];
                const cell = this.getCell(row, col);
                if (!cell || cell != player) break;
                winPattern.push(row + '-' + col);
            }
            if (winPattern.length >= 5) {
                this.turn = undefined;
                this.status = 'endgame';
                return {
                    winner: player,
                    winPattern,
                };
            }
        }

        return false;
    }

    move(player: 'x' | 'o', row: number, col: number) {
        if (this.turn !== player || this.status !== 'in-game') {
            throw new Error('Invalid turn');
        }

        if (row < 0 || row >= 15 || col < 0 || row >= 15 || this.map[row][col]) {
            throw new Error('Invalid move');
        }

        this.map[row][col] = player;

        this.turn = player === 'x' ? 'o' : 'x';
    }
}
