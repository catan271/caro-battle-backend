export class BotController {
    static firstMove() {
        return {
            row: 7,
            col: 7,
        };
    }

    static generateMove(map, bot) {
        let row = Math.floor(Math.random() * 15);
        let col = Math.floor(Math.random() * 15);
        while (map[row][col]) {
            row = Math.floor(Math.random() * 15);
            col = Math.floor(Math.random() * 15);
        }
        return { row, col };
    }
}
