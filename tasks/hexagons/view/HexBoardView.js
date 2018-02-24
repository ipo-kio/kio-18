export class HexBoardView {

    _board;
    _sizing;

    constructor(board, sizing) {
        this._board = board;
        this._sizing = sizing;
    }

    get board() {
        return this._board;
    }

    get sizing() {
        return this._sizing;
    }
}