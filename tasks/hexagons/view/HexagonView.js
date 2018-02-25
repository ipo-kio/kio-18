import {sin30, sin60} from "../model/sizing";

export const CELL_STATE_NORMAL = 0;
export const CELL_STATE_HIGHLIGHTED = 1;

export class HexagonView {
    _board_view;
    _hex_cell;
    _display_object;

    _state = CELL_STATE_NORMAL;

    constructor(board_view, hex_cell) {
        this._board_view = board_view;
        this._hex_cell = hex_cell;

        this.init_display_object();
        this.redraw();
    }

    init_display_object() {
        this._display_object = new createjs.Shape();
    }

    redraw() {
        let g = this._display_object.graphics;

        let dx1 = this.sizing.R * sin60;
        let dy1 = this.sizing.R * sin30;
        let dy2 = this.sizing.R;
        let {x, y} = this._hex_cell.coordinates(this.sizing);

        g
            .clear()
            .setStrokeStyle(1)
            .beginStroke(this._state === CELL_STATE_NORMAL ? "black" : "black")
            .beginFill(this._state === CELL_STATE_NORMAL ? "blue" : "yellow")
            .moveTo(x - dx1, y - dy1)
            .lineTo(x, y - dy2)
            .lineTo(x + dx1, y - dy1)
            .lineTo(x + dx1, y + dy1)
            .lineTo(x, y + dy2)
            .lineTo(x - dx1, y + dy1)
            .closePath();
    }

    get display_object() {
        return this._display_object;
    }

    get state() {
        return this._state;
    }

    get sizing() {
        return this._board_view.sizing;
    }

    set state(value) {
        this._state = value;
        this.redraw();
    }
}