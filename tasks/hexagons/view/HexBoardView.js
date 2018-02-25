import {HexagonView} from "./HexagonView";

export class HexBoardView {

    _board;
    _sizing;

    _display_object;

    constructor(board, sizing) {
        this._board = board;
        this._sizing = sizing;

        this.init_display_object();
    }

    get board() {
        return this._board;
    }

    get sizing() {
        return this._sizing;
    }

    init_display_object() {
        this._display_object = new createjs.Container();
        for (let cell of this._board.cells()) {
            let cell_view = new HexagonView(this, cell);
            this._display_object.addChild(cell_view.display_object);
        }
    }

    get display_object() {
        return this._display_object;
    }
}