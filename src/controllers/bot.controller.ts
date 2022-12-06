import { Role } from "types/role.type";

export class BotController {
    static WIN_SCORE = 100000000;
    static WIN_GUARANTEE = 100000;

    static getPlayer(bot: Role) {
        return bot === 'x' ? 'o' : 'x';
    }

    static firstMove() {
        return {
            row: 7,
            col: 7,
        };
    }

    static is_cell_near(map, row, col) {
        for (let k = row - 1, m = row + 2; k < m; k++) {
            if (k < 0) continue;
            if (k >= 15) break;
            for (let l = col - 1, n = col + 2; l < n; l++) {
                if (l < 0) continue;
                if (l >= 15) break;
                if (k == row && l == col) continue;
                if (map[k][l] != null) return true;
            }
        }
    }

    static possible_moves(map) {
        // Trả về những điểm gần những điểm đã đánh
        const moves = [];
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                if (map[row][col] == null && BotController.is_cell_near(map, row, col)) {
                    moves.push({ row, col });
                }
            }
        }
        return moves;
    }

    static eval_shape(count, open_ends, currentTurn) {
        if (open_ends == 0 && count < 5) {
            return 0;
        }
        switch (count) {
            case 5:
                return BotController.WIN_SCORE;
            case 4:
                if (currentTurn) return BotController.WIN_GUARANTEE;
                else return open_ends == 2 ? BotController.WIN_GUARANTEE / 4 : 200;
            case 3:
                if (currentTurn) return open_ends == 2 ? 50000 : 10;
                else return open_ends == 2 ? 200 : 5;
            case 2:
                if (currentTurn) return open_ends == 2 ? 7 : 3;
                else return open_ends == 2 ? 5 : 3;
            case 1:
                return 1;
            default:
                return BotController.WIN_GUARANTEE * 2;
        }
    }
    static analyze_lines(map, row, col, scores, is_my_turn, color) {
        if (map[row][col] == color) {
            scores.consecutive++;
        } else if (map[row][col] == null) {
            if (scores.consecutive > 0) {
                scores.open_ends++;
                scores.score += BotController.eval_shape(scores.consecutive, scores.open_ends, is_my_turn);
                scores.consecutive = 0;
            }
            scores.open_ends = 1;
        } else if (scores.consecutive > 0) {
            scores.score += BotController.eval_shape(scores.consecutive, scores.open_ends, is_my_turn);
            scores.consecutive = 0;
            scores.open_ends = 0;
        } else {
            scores.open_ends = 0;
        }
        return scores;
    }

    static analyze_map_for_color(map, color, is_my_turn) {
        let rows = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };
        let columns = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };
        let diag_bl = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };
        let diag_ul = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };
        let diag_ur = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };
        let diag_br = {
            consecutive: 0,
            open_ends: 0,
            score: 0,
        };

        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                rows = BotController.analyze_lines(map, row, col, rows, is_my_turn, color);
                columns = BotController.analyze_lines(map, col, row, columns, is_my_turn, color);
                if (col + row < 15) {
                    diag_bl = BotController.analyze_lines(map, row + col, col, diag_bl, is_my_turn, color);
                    diag_ul = BotController.analyze_lines(map, 14 - row - col, col, diag_ul, is_my_turn, color);
                    if (col > 0 && row != 10) {
                        diag_ur = BotController.analyze_lines(map, col - 1, row + col, diag_ur, is_my_turn, color);
                        diag_br = BotController.analyze_lines(map, 15 - col, row + col, diag_br, is_my_turn, color);
                    }
                }
            }
            if (rows.consecutive > 0) {
                rows.score += BotController.eval_shape(rows.consecutive, rows.open_ends, is_my_turn);
            }
            rows.open_ends = 0;
            rows.consecutive = 0;

            if (columns.consecutive > 0)
                columns.score += BotController.eval_shape(columns.consecutive, columns.open_ends, is_my_turn);
            columns.open_ends = 0;
            columns.consecutive = 0;

            if (diag_bl.consecutive > 0)
                diag_bl.score += BotController.eval_shape(diag_bl.consecutive, diag_bl.open_ends, is_my_turn);
            diag_bl.open_ends = 0;
            diag_bl.consecutive = 0;

            if (diag_br.consecutive > 0)
                diag_br.score += BotController.eval_shape(diag_br.consecutive, diag_br.open_ends, is_my_turn);
            diag_br.open_ends = 0;
            diag_br.consecutive = 0;

            if (diag_ul.consecutive > 0)
                diag_ul.score += BotController.eval_shape(diag_ul.consecutive, diag_ul.open_ends, is_my_turn);
            diag_ul.open_ends = 0;
            diag_ul.consecutive = 0;

            if (diag_ur.consecutive > 0)
                diag_ur.score += BotController.eval_shape(diag_ur.consecutive, diag_ur.open_ends, is_my_turn);
            diag_ur.open_ends = 0;
            diag_ur.consecutive = 0;
        }
        return rows.score + columns.score + diag_bl.score + diag_br.score + diag_ul.score + diag_ur.score;
    }

    static analyze_AI_pos(map, is_AI_turn, bot) {
        const AI_score = BotController.analyze_map_for_color(map, bot, !is_AI_turn);
        let player_score = BotController.analyze_map_for_color(map, BotController.getPlayer(bot), is_AI_turn);
        if (player_score == 0) {
            player_score = 1;
        }
        return AI_score / player_score;
    }

    static minimaxSearchAB(depth, map, isMax, alpha, beta, bot) {
        if (depth == 0) {
            return { grade: BotController.analyze_AI_pos(map, !isMax, bot), location: { row: -1, col: -1 } };
        }

        const allPossibleMoves = BotController.possible_moves(map);
        if (allPossibleMoves.length == 0) {
            return { grade: BotController.analyze_AI_pos(map, !isMax, bot), location: { row: -1, col: -1 } };
        }

        const bestMove = { grade: 0, location: { row: 0, col: 0 } };
        if (isMax) {
            bestMove.grade = -1;
            for (const move of allPossibleMoves) {
                map[move.row][move.col] = bot;
                const tmpMove = BotController.minimaxSearchAB(depth - 1, map, false, alpha, beta, bot);
                map[move.row][move.col] = null;

                if (tmpMove.grade > alpha) alpha = tmpMove.grade;
                if (tmpMove.grade >= beta) return tmpMove;
                if (tmpMove.grade > bestMove.grade) {
                    bestMove.grade = tmpMove.grade;
                    bestMove.location = move;
                }
            }
        } else {
            bestMove.grade = 100000000;
            bestMove.location = allPossibleMoves[0];

            for (const move of allPossibleMoves) {
                map[move.row][move.col] = BotController.getPlayer(bot);
                const tmpMove = BotController.minimaxSearchAB(depth - 1, map, true, alpha, beta, bot);
                map[move.row][move.col] = null;
                if (tmpMove.grade < beta) beta = tmpMove.grade;
                if (tmpMove.grade <= alpha) return tmpMove;
                if (tmpMove.grade < bestMove.grade) {
                    bestMove.grade = tmpMove.grade;
                    bestMove.location = move;
                }
            }
        }
        return bestMove;
    }

    static generateMove(map, bot) {
        const bestMove = BotController.minimaxSearchAB(4, map, true, -1.0, 100000000, bot);
        return bestMove.grade < 0 ? { row: 0, col: 0 } : bestMove.location;
    }
}
