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

        let r = this.sizing.R - 1;
        let dx1 = r * sin60;
        let dy1 = r * sin30;
        let dy2 = r;
        let {x, y} = this._hex_cell.coordinates(this.sizing);
        let val = this._board_view.board.value(this._hex_cell);

        let go_around = (delta=1) => {
            g.moveTo(x - dx1 * delta, y - dy1 * delta)
                .lineTo(x, y - dy2 * delta)
                .lineTo(x + dx1 * delta, y - dy1 * delta)
                .lineTo(x + dx1 * delta, y + dy1 * delta)
                .lineTo(x, y + dy2 * delta)
                .lineTo(x - dx1 * delta, y + dy1 * delta)
                .closePath();
        };

        let very_highlighted = CELL_STATE_HIGHLIGHTED && this._board_view.changeable;
        let fill_color = 'rgba(131,204,236,0.7)';

        g
            .clear()
            .beginFill(types[val].bg_color);
        go_around();
        if (this._state === CELL_STATE_HIGHLIGHTED) {
            g.beginStroke(null).beginFill(fill_color);
            go_around(very_highlighted ? 1 : 0.5);
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

    __rollover_handler = e => {
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

let S = 8;
let sq3 = Math.sqrt(3) / 2;
let sq2 = Math.sqrt(2);

let types = [
    new TypeDrawer("#FFFFFF", (g, x0, y0) => {
        //draw nothing
        g.beginStroke("black").drawCircle(x0, y0, 5);
    }),
    new TypeDrawer("#FFFFFF", (g, x0, y0) => {
        //draw nothing
    }),
    new TypeDrawer("#FFF017", (g, x0, y0) => {
        g.beginFill('black').drawCircle(x0, y0, 6);
    }),
    new TypeDrawer("#F17F0D", (g, x0, y0) => {
        // g.beginFill('black').rect(x0 - S, y0 - S, 2 * S, 2 * S);
        // y0 += 2;
        g.beginStroke('black').setStrokeStyle(4, "round")
            .moveTo(x0, y0)
            .lineTo(x0, y0 - S)
            .moveTo(x0, y0)
            .lineTo(x0 - S / sq2, y0 + S / sq2)
            .moveTo(x0, y0)
            .lineTo(x0 + S / sq2, y0 + S / sq2);
    }),
    new TypeDrawer("#E34790", (g, x0, y0) => {
        g.setStrokeStyle(4, "round").beginStroke('black')
            .moveTo(x0, y0 - S)
            .lineTo(x0, y0 + S)
            .moveTo(x0 + 6, y0 - S / 2)
            .lineTo(x0 + 6, y0 + S / 2)
            .moveTo(x0 - 6, y0 - S / 2)
            .lineTo(x0 - 6, y0 + S / 2);
    })
];
