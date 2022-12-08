import { EndgameDto } from '../dto/endgame.dto';
import { EndgameCallback } from '../types/endgame-callback.types';
import { Role } from '../types/role.type';

export class GameController {
    map: Array<Array<Role>>;
    turn: Role;
    status: 'waiting' | 'waiting-lock' | 'in-game' | 'endgame';
    time: number;
    countdown: NodeJS.Timeout;
    endgame: EndgameCallback;

    constructor(time: number, endgame: EndgameCallback) {
        this.map = [...Array(15)].map(() => {
            return [...Array(15)].map(() => null);
        });
        this.turn = undefined;
        this.status = 'waiting';
        this.time = time;
        this.endgame = endgame;
    }

    start() {
        this.status = 'in-game';
        this.turn = this.turn || 'x';
        if (this.time) {
            this.countdown = setTimeout(() => {
                const winner = this.turn === 'x' ? 'o' : 'x';
                this.triggerEndgame({
                    winner,
                    winPattern: [],
                });
            }, this.time * 1000);
        }
    }

    getCell(r: number, c: number) {
        return this.map[r]?.[c];
    }

    checkWinner(player: Role, r: number, c: number) {
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
                if (cell != player) break;
                winPattern.push(row + '-' + col);
            }
            for (let i = 1; i < 5; i++) {
                const row = r - i * direction[0];
                const col = c - i * direction[1];
                const cell = this.getCell(row, col);
                if (cell != player) break;
                winPattern.push(row + '-' + col);
            }
            if (winPattern.length >= 5) {
                return this.triggerEndgame({
                    winner: player,
                    winPattern,
                });
            }
        }
    }

    move(player: Role, row: number, col: number) {
        if (this.turn !== player || this.status !== 'in-game') {
            throw new Error('Invalid turn');
        }

        if (row < 0 || row >= 15 || col < 0 || row >= 15 || this.map[row][col]) {
            throw new Error('Invalid move');
        }

        this.map[row][col] = player;

        // change turn, reset countdown
        this.turn = player === 'x' ? 'o' : 'x';
        if (this.time) {
            clearTimeout(this.countdown);
            this.countdown = setTimeout(() => {
                this.triggerEndgame({
                    winner: player,
                    winPattern: [],
                });
            }, this.time * 1000);
        }
        this.checkWinner(player, row, col);
    }

    triggerEndgame(data: EndgameDto) {
        if (this.status === 'endgame') return;
        this.turn = undefined;
        this.status = 'endgame';
        clearTimeout(this.countdown);
        return this.endgame(data);
    }
}
