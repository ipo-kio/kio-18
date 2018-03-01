import {sin30, sin60} from "../model/sizing";
import {TYPES_COUNT} from "../model/HexBoard";
import {EventDispatcherInterface, Event} from "../EventDispatcherMixin";

export const CELL_STATE_NORMAL = 0;
export const CELL_STATE_HIGHLIGHTED = 1;

export class HexagonView extends EventDispatcherInterface {
    _board_view;
    _hex_cell;
    _display_object;

    _state = CELL_STATE_NORMAL;
    _changeable = false;

    _allow_zero = true;

    constructor(board_view, hex_cell) {
        super();
        this._board_view = board_view;
        this._hex_cell = hex_cell;

        this.init_display_object();
        this.redraw();
    }

    init_display_object() {
        this._display_object = new createjs.Shape();

        this._display_object.addEventListener('rollover', this.__rollover_handler);
        this._display_object.addEventListener('rollout', this.__rollout_handler);
    }

    redraw() {
        let g = this._display_object.graphics;

        let dx1 = this.sizing.R * sin60;
        let dy1 = this.sizing.R * sin30;
        let dy2 = this.sizing.R;
        let {x, y} = this._hex_cell.coordinates(this.sizing);
        let val = this._board_view.board.value(this._hex_cell);

        let go_around = () => {
            g.moveTo(x - dx1, y - dy1)
                .lineTo(x, y - dy2)
                .lineTo(x + dx1, y - dy1)
                .lineTo(x + dx1, y + dy1)
                .lineTo(x, y + dy2)
                .lineTo(x - dx1, y + dy1)
                .closePath();
        };

        g
            .clear()
            .setStrokeStyle(1)
            .beginStroke("black")
            .beginFill(types[val].bg_color);
        go_around();
        if (this._state === CELL_STATE_HIGHLIGHTED) {
            g.beginFill('rgba(255,255,128,0.7)').setStrokeStyle(0);
            go_around();
        }

        types[val].drawer(g, x, y);
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

    get changeable() {
        return this._changeable;
    }

    __rollover_handler = () => {
        this._state = CELL_STATE_HIGHLIGHTED;
        this.redraw();
        this.fire(new Event('rollover', this));
    };

    __rollout_handler = () => {
        this._state = CELL_STATE_NORMAL;
        this.redraw();
        this.fire(new Event('rollout', this));
    };

    __click_handler = () => {
        let val = this._board_view.board.value(this._hex_cell);
        val += 1;
        if (val > TYPES_COUNT)
            val = this._allow_zero ? 0 : 1;
        this._board_view.board.set_value(this._hex_cell, val);
        this.redraw();

        this.fire(new Event('change', this));
    };

    set changeable(value) {
        this._changeable = value;

        if (value) {
            // this._display_object.addEventListener('rollover', this.__rollover_handler);
            // this._display_object.addEventListener('rollout', this.__rollout_handler);
            this._display_object.addEventListener('click', this.__click_handler);
        } else {
            // this._display_object.removeEventListener('rollover', this.__rollover_handler);
            // this._display_object.removeEventListener('rollout', this.__rollout_handler);
            this._display_object.removeEventListener('click', this.__click_handler);
        }
    }

    get allow_zero() {
        return this._allow_zero;
    }

    set allow_zero(value) {
        this._allow_zero = value;
    }

    get hex_cell() {
        return this._hex_cell;
    }
}

class TypeDrawer {
    _bg_color;
    _drawer; //function(graphics, x0, y0)

    constructor(bg_color, drawer) {
        this._bg_color = bg_color;
        this._drawer = drawer;
    }

    get bg_color() {
        return this._bg_color;
    }

    get drawer() {
        return this._drawer;
    }
}

let S = 6;

let types = [
    new TypeDrawer("#FFFFFF", (g, x0, y0) => {
        //draw nothing
    }),
    new TypeDrawer("#e3e41e", (g, x0, y0) => {
        g.beginFill('black').drawCircle(x0, y0, S);
    }),
    new TypeDrawer("#734CFF", (g, x0, y0) => {
        g.beginFill('black').rect(x0 - S, y0 - S, 2 * S, 2 * S);
    }),
    new TypeDrawer("#09cb2c", (g, x0, y0) => {
        g.setStrokeStyle(2).beginStroke('black')
            .moveTo(x0 - S, y0 - S)
            .lineTo(x0 + S, y0 + S)
            .moveTo(x0 - S, y0 + S)
            .lineTo(x0 + S, y0 - S);
    })
];
