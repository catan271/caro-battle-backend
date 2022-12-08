export interface Move {
    row: number;
    col: number;
}

export interface MoveEvaluation {
    score: number;
    move: Move;
}

export interface LineEvaluation {
    consecutive: number;
    openEnds: number;
    score: number;
}
