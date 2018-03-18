import {HexagonView} from "./HexagonView";
import {Rule} from "../model/HexBoard";
import {Event, EventDispatcherInterface} from "../EventDispatcherMixin";

const RULE_RESULT_SHIFT = 12;

export class HexBoardView extends EventDispatcherInterface {

    _board;
    _cell_views;
    _sizing;

    _display_object;
    _canvas;
    _stage;
    _padding;

    _changeable = false;

    constructor(board, sizing, padding=0) {
        super();

        this._board = board;
        this._sizing = sizing;
        this._padding = padding;

        this.init_display_object();

        this.init_canvas();
    }

    set board(value) {
        this._board = value;
        this.redraw();
    }

    get board() {
        return this._board;
    }

    get sizing() {
        return this._sizing;
    }

    init_display_object() {
        this._display_object = new createjs.Container();

        let {left} = this._board.coordinate_diapason(this._sizing);
        let cell_x = -left + this._sizing.H + this._padding;
        let cell_y = this._sizing.R + this._padding;

        let is_rule = this._board instanceof Rule;

        let rule_cell = null;
        if (this.board instanceof Rule)
            rule_cell = this.board.result_cell;
        else {
            let bg = new createjs.Shape();
            this._display_object.addChild(bg);
            let {width, height} = this.preferred_size;
            bg.graphics.beginFill('#0659B9').rect(0, 0, width, height);
        }

        this._cell_views = [];
        for (let cell of this._board.cells()) {
            let cell_view = new HexagonView(this, cell);
            this._display_object.addChild(cell_view.display_object);
            cell_view._display_object.x = cell_x;
            cell_view._display_object.y = cell_y;
            this._cell_views.push(cell_view);

            if (cell.equals(rule_cell) || rule_cell === null)
                cell_view.allow_zero = false;

            cell_view.add_listener('change', () => this.fire(new Event('change', this)));

            if (is_rule && cell.equals(this.board.result_cell))
                cell_view._display_object.x += RULE_RESULT_SHIFT;
        }
    }

    get display_object() {
        return this._display_object;
    }

    get canvas() {
        return this._canvas;
    }

    get preferred_size() {
        let {left, right} = this._board.coordinate_diapason(this._sizing);
        let additional_width = this._board instanceof Rule ? RULE_RESULT_SHIFT : 0;

        return {
            width: Math.ceil(right - left + 2 * this._sizing.H) + additional_width + 2 * this._padding,
            height: (this._board.lines - 1) * this._sizing.R * 3 / 2 + 2 * this._sizing.R + 2 * this._padding
        };
    }

    init_canvas() {
        this._canvas = document.createElement('canvas');
        let {width: canvas_width, height: canvas_height} = this.preferred_size;
        this._canvas.width = canvas_width;
        this._canvas.height = canvas_height;
        this._canvas.className = "kio-hexagons-canvas";

        this._stage = new createjs.Stage(this._canvas);
        this._stage.addChild(this._display_object);
        this._stage.enableMouseOver(10);

        createjs.Ticker.addEventListener('tick', this._stage);
    }

    get changeable() {
        return this._changeable;
    }

    set changeable(value) {
        this._changeable = value;

        for (let cell_view of this._cell_views)
            cell_view.changeable = value;
    }

    redraw() {
        for (let cell_view of this._cell_views)
            cell_view.redraw();
    }

    add_listener_to_all_cell_views(type, action) {
        for (let cell_view of this._cell_views)
            cell_view.add_listener(type, action);
    }
}