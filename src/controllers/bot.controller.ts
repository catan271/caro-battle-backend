import { shuffle } from 'lodash';
import { LineEvaluation, Move, MoveEvaluation } from '../types/evaluation.interface';
import { Role } from '../types/role.type';

export class BotController {
    static WIN_SCORE = 1000000000;
    static LOSE_SCORE = -100000000;
    static WIN_GUARANTEE = 100_000;

    static getPlayer(bot: Role) {
        return bot === 'x' ? 'o' : 'x';
    }

    static firstMove(): Move {
        return {
            row: 7,
            col: 7,
        };
    }

    static checkWinner(map: Role[][], row: number, col: number) {
        const role = map[row][col];
        if (!role) {
            console.log('err');
        }

        // check line
        let streak = 1;
        for (let i = 1; i < 5; i++) {
            if (map[row]?.[col + i] !== role) break;
            streak++;
        }
        for (let i = 1; i < 5; i++) {
            if (map[row]?.[col - i] !== role) break;
            streak++;
        }
        if (streak >= 5) return true;

        // check column
        streak = 1;
        for (let i = 1; i < 5; i++) {
            if (map[row + i]?.[col] !== role) break;
            streak++;
        }
        for (let i = 1; i < 5; i++) {
            if (map[row - i]?.[col] !== role) break;
            streak++;
        }
        if (streak >= 5) return true;

        //check diagonal 1
        streak = 1;
        for (let i = 1; i < 5; i++) {
            if (map[row + i]?.[col + i] !== role) break;
            streak++;
        }
        for (let i = 1; i < 5; i++) {
            if (map[row - i]?.[col - i] !== role) break;
            streak++;
        }
        if (streak >= 5) return true;

        // check diagonal 2
        streak = 1;
        for (let i = 1; i < 5; i++) {
            if (map[row - i]?.[col + i] !== role) break;
            streak++;
        }
        for (let i = 1; i < 5; i++) {
            if (map[row + i]?.[col - i] !== role) break;
            streak++;
        }
        if (streak >= 5) return true;
    }

    static isCellNear(map: Role[][], row: number, col: number) {
        for (let k = row - 1, m = row + 2; k < m; k++) {
            if (k < 0) continue;
            if (k >= 15) break;
            for (let l = col - 1, n = col + 2; l < n; l++) {
                if (l < 0) continue;
                if (l >= 15) break;
                if (k == row && l == col) continue;
                if (map[k][l]) return true;
            }
        }
    }

    static possibleMoves(map: Role[][]) {
        const moves: Move[] = [];
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (!map[row][col] && BotController.isCellNear(map, row, col)) {
                    moves.push({ row, col });
                }
            }
        }
        return shuffle(moves);
        // return moves;
    }

    static evaluateShape(count: number, openEnds: number, isMyTurn: boolean) {
        if (openEnds == 0 && count < 5) {
            return 0;
        }
        switch (count) {
            case 5:
                return BotController.WIN_GUARANTEE * (openEnds + 6);
            case 4:
                if (isMyTurn) return BotController.WIN_GUARANTEE * (2 + openEnds);
                else return openEnds == 2 ? BotController.WIN_GUARANTEE : 40_000;
            case 3:
                if (isMyTurn) return openEnds == 2 ? 50_000 : 10;
                else return openEnds == 2 ? 200 : 5;
            case 2:
                if (isMyTurn) return openEnds == 2 ? 7 : 3;
                else return openEnds == 2 ? 5 : 3;
            case 1:
                return 1;
            default:
                return BotController.WIN_GUARANTEE * 10;
        }
    }
    static evaluateLines(
        map: Role[][],
        row: number,
        col: number,
        lineValue: LineEvaluation,
        isMyTurn: boolean,
        role: Role,
    ) {
        if (map[row][col] == role) {
            lineValue.consecutive++;
        } else if (map[row][col] == null) {
            if (lineValue.consecutive > 0) {
                lineValue.openEnds++;
                lineValue.score += BotController.evaluateShape(lineValue.consecutive, lineValue.openEnds, isMyTurn);
                lineValue.consecutive = 0;
            }
            lineValue.openEnds = 1;
        } else if (lineValue.consecutive > 0) {
            lineValue.score += BotController.evaluateShape(lineValue.consecutive, lineValue.openEnds, isMyTurn);
            lineValue.consecutive = 0;
            lineValue.openEnds = 0;
        } else {
            lineValue.openEnds = 0;
        }
    }

    static evaluateStateForRole(map: Role[][], role: Role, isMyTurn: boolean) {
        const [rows, columns, diagBL, diagUL, diagBR, diagUR]: LineEvaluation[] = [...Array(6)].map(() => ({
            consecutive: 0,
            openEnds: 0,
            score: 0,
        }));

        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                BotController.evaluateLines(map, row, col, rows, isMyTurn, role);
                BotController.evaluateLines(map, col, row, columns, isMyTurn, role);
                if (col + row < 15) {
                    BotController.evaluateLines(map, row + col, col, diagBL, isMyTurn, role);
                    BotController.evaluateLines(map, 14 - row - col, col, diagUL, isMyTurn, role);
                    if (col > 0) {
                        BotController.evaluateLines(map, col - 1, row + col, diagUR, isMyTurn, role);
                        BotController.evaluateLines(map, 15 - col, row + col, diagBR, isMyTurn, role);
                    }
                }
            }
            if (rows.consecutive > 0) {
                rows.score += BotController.evaluateShape(rows.consecutive, rows.openEnds, isMyTurn);
            }
            rows.openEnds = 0;
            rows.consecutive = 0;

            if (columns.consecutive > 0) {
                columns.score += BotController.evaluateShape(columns.consecutive, columns.openEnds, isMyTurn);
            }
            columns.openEnds = 0;
            columns.consecutive = 0;

            if (diagBL.consecutive > 0) {
                diagBL.score += BotController.evaluateShape(diagBL.consecutive, diagBL.openEnds, isMyTurn);
            }
            diagBL.openEnds = 0;
            diagBL.consecutive = 0;

            if (diagBR.consecutive > 0) {
                diagBR.score += BotController.evaluateShape(diagBR.consecutive, diagBR.openEnds, isMyTurn);
            }
            diagBR.openEnds = 0;
            diagBR.consecutive = 0;

            if (diagUL.consecutive > 0) {
                diagUL.score += BotController.evaluateShape(diagUL.consecutive, diagUL.openEnds, isMyTurn);
            }
            diagUL.openEnds = 0;
            diagUL.consecutive = 0;

            if (diagUR.consecutive > 0) {
                diagUR.score += BotController.evaluateShape(diagUR.consecutive, diagUR.openEnds, isMyTurn);
            }
            diagUR.openEnds = 0;
            diagUR.consecutive = 0;
        }
        return rows.score + columns.score + diagBL.score + diagBR.score + diagUL.score + diagUR.score;
    }

    static evaluateState(map: Role[][], isBotTurn: boolean, bot: Role) {
        const botScore = BotController.evaluateStateForRole(map, bot, isBotTurn);
        let playerScore = BotController.evaluateStateForRole(map, BotController.getPlayer(bot), !isBotTurn);
        if (playerScore == 0) {
            playerScore = 0.0001;
        }
        return botScore - playerScore;
    }

    static minimaxSearchAB(
        depth: number,
        map: Role[][],
        isMax: boolean,
        alpha: number,
        beta: number,
        bot: Role,
    ): MoveEvaluation {
        if (depth == 0) {
            return { score: BotController.evaluateState(map, isMax, bot), move: null };
        }

        const allPossibleMoves = BotController.possibleMoves(map);
        if (allPossibleMoves.length == 0) {
            return { score: BotController.evaluateState(map, isMax, bot), move: null };
        }

        const bestMove: MoveEvaluation = { score: 0, move: allPossibleMoves[0] };
        if (isMax) {
            bestMove.score = BotController.LOSE_SCORE;

            for (const move of allPossibleMoves) {
                map[move.row][move.col] = bot;

                // const nextDepth = depth - 1;
                const nextDepth = BotController.checkWinner(map, move.row, move.col) ? 0 : depth - 1;

                const tmpMove = BotController.minimaxSearchAB(nextDepth, map, false, alpha, beta, bot);
                map[move.row][move.col] = null;

                if (tmpMove.score >= beta) {
                    return tmpMove;
                }
                if (tmpMove.score > alpha) {
                    alpha = tmpMove.score;
                }
                if (tmpMove.score > bestMove.score) {
                    bestMove.score = tmpMove.score;
                    bestMove.move = move;
                }
            }
        } else {
            bestMove.score = BotController.WIN_SCORE;

            for (const move of allPossibleMoves) {
                map[move.row][move.col] = BotController.getPlayer(bot);

                // const nextDepth = depth - 1;
                const nextDepth = BotController.checkWinner(map, move.row, move.col) ? 0 : depth - 1;

                const tmpMove = BotController.minimaxSearchAB(nextDepth, map, true, alpha, beta, bot);
                map[move.row][move.col] = null;

                if (tmpMove.score <= alpha) {
                    return tmpMove;
                }
                if (tmpMove.score < beta) {
                    beta = tmpMove.score;
                }
                if (tmpMove.score < bestMove.score) {
                    bestMove.score = tmpMove.score;
                    bestMove.move = move;
                }
            }
        }
        return bestMove;
    }

    static generateMove(map: Role[][], bot: Role): Move {
        const bestMove = BotController.minimaxSearchAB(
            Number(process.env.BOT_MINIMAX_DEPTH) || 3,
            map,
            true,
            BotController.LOSE_SCORE,
            BotController.WIN_SCORE,
            bot,
        );
        // console.log(bestMove);

        return bestMove.move;
    }
}
