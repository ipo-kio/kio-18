import {PointView} from "./PointView";
import {SpringView} from "./SpringView";
import {EventDispatcher, Event} from "../EventDispatcher";
import {PointWithPosition} from "../model/PointWithPosition";
import {Spring} from "../model/Spring";
import {POINT_TYPE_NORMAL} from "../model/point_types";
import {MODE_CREATE_VERTEX} from "./ModeSelector";

export const WIDTH = 700;
export const HEIGHT = 400;
const X0 = WIDTH / 2;
const Y0 = HEIGHT / 2;

const GRID_STEP = 5;
export const GRID_STEP_SIZE = 0.1;

export const NATURAL_X_MIN = Math.ceil(-X0 / GRID_STEP * GRID_STEP_SIZE);
export const NATURAL_Y_MIN = Math.ceil(-Y0 / GRID_STEP * GRID_STEP_SIZE);
export const NATURAL_X_MAX = Math.floor((WIDTH - X0) / GRID_STEP * GRID_STEP_SIZE);
export const NATURAL_Y_MAX = Math.floor((HEIGHT - Y0) / GRID_STEP * GRID_STEP_SIZE);

export function n2s({x: x_natural, y: y_natural}) {
    return {
        x: X0 + x_natural / GRID_STEP_SIZE * GRID_STEP,
        y: Y0 - y_natural / GRID_STEP_SIZE * GRID_STEP
    }
}

export function s2n({x: x_screen, y: y_screen}) {
    return {
        x: (x_screen - X0) / GRID_STEP * GRID_STEP_SIZE,
        y: (Y0 - y_screen) / GRID_STEP * GRID_STEP_SIZE
    };
}

export default class GridView {

    _grid;
    _display_object;

    _points_set_view;
    _edges_set_view;

    _is_creating_a_new_edge = false;
    _point_being_moved;
    _virtual_edge;
    _virtual_edge_view;
    _virtual_edge_layer = new createjs.Container();
    _virtual_point_layer = new createjs.Container();
    _virtual_point;
    _virtual_point_view;
    _rolled_over_point = null;

    _ed = new EventDispatcher(); //'grid click' click out of any visible elements
    _allow_move = true;

    _point_type_to_create = POINT_TYPE_NORMAL;
    _mouse_actions_mode = MODE_CREATE_VERTEX;

    constructor() {
        this.init_display_object();

        this._edges_set_view = new SetView(this._display_object, spring => this.init_edge(spring));

        this._display_object.addChild(this._virtual_edge_layer);
        this._display_object.addChild(this._virtual_point_layer);

        this._points_set_view = new SetView(this._display_object, pwp => this.init_point_with_position(pwp));

        this._grid.addEventListener('mousedown', e => {
            if (e.target === this._grid) {
                let display_object_local = this._grid.localToLocal(e.localX, e.localY, this._display_object);
                this._ed.fire(new GridClickEvent(this, s2n(display_object_local)));
            }
        });
    }

    init_edge(spring) {
        let view = new SpringView(spring);
        view.display_object.addEventListener("dblclick", () => {
            this.springs_set.remove_object(spring);
        });
        return view;
    }

    init_point_with_position(pwp) {
        let pv = new PointView(pwp, this._allow_move);

        pv.display_object.addEventListener("dblclick", () => {
            this.point_set.remove_object(pwp);

            //remove all edges
            this.springs_set.filter(
                spring => spring.first_point_with_position !== pwp && spring.second_point_with_position !== pwp
            );
        });
        pv.display_object.addEventListener("pressmove", e => {
            let natural_pos = s2n({x: pv.display_object.x + e.localX, y: pv.display_object.y + e.localY});

            if (!this._is_creating_a_new_edge) {
                this._is_creating_a_new_edge = true;
                this._point_being_moved = pv;

                this._virtual_point = new PointWithPosition(
                    natural_pos.x,
                    natural_pos.y,
                    this._point_type_to_create
                );
                this._virtual_point_view = new PointView(this._virtual_point, false);

                this._virtual_edge = new Spring(pv._point_with_position, this._virtual_point);
                this._virtual_edge_view = new SpringView(this._virtual_edge);

                this._virtual_edge_layer.addChild(this._virtual_edge_view.display_object);
                this._virtual_point_layer.addChild(this._virtual_point_view.display_object);
            } else {
                this._virtual_point.set_location(natural_pos);
                this._virtual_edge.relength();
            }
        });
        pv.display_object.addEventListener("pressup", () => {
            if (!this._is_creating_a_new_edge)
                return;

            if (this._rolled_over_point) {
                this.springs_set.add_object(
                    new Spring(
                        this._point_being_moved.point_with_position,
                        this._rolled_over_point.point_with_position
                    )
                );
            } else {
                //create new point
                this.point_set.add_object(this._virtual_point);
                this.springs_set.add_object(this._virtual_edge);
            }

            this._virtual_point_layer.removeChild(this._virtual_point_view.display_object);
            this._virtual_edge_layer.removeChild(this._virtual_edge_view.display_object);

            this._is_creating_a_new_edge = false;
        });
        pv.display_object.addEventListener("rollover", e => {
            this._rolled_over_point = pv;
            if (this._virtual_point_view)
                this._virtual_point_view.display_object.visible = false;
        });
        pv.display_object.addEventListener("rollout", e => {
            this._rolled_over_point = null;
            if (this._virtual_point_view)
                this._virtual_point_view.display_object.visible = true;
        });

        return pv;
    }

    get point_set() {
        return this._points_set_view.set;
    }

    set point_set(value) {
        this._points_set_view.set = value;
    }

    get springs_set() {
        return this._edges_set_view.set;
    }

    set springs_set(value) {
        this._edges_set_view.set = value;
    }

    get point_type_to_create() {
        return this._point_type_to_create;
    }

    set point_type_to_create(value) {
        this._point_type_to_create = value;
    }

    get mouse_actions_mode() {
        return this._mouse_actions_mode;
    }

    set mouse_actions_mode(value) {
        this._mouse_actions_mode = value;
    }

    init_display_object() {
        this._display_object = new createjs.Container();

        this.init_grid();

        this._grid.x = X0;
        this._grid.y = Y0;
        this._display_object.addChild(this._grid);
    }

    init_grid() {
        this._grid = new createjs.Shape();

        this.draw_grid();
    }

    draw_grid() {
        let g = this._grid.graphics;
        this.draw_empty_grid(g);

        g.setStrokeStyle(0.1).beginStroke('#666');

        let i_min = -Math.floor(X0 / GRID_STEP);
        let i_max = Math.floor((WIDTH - X0) / GRID_STEP);
        let j_min = -Math.floor(Y0 / GRID_STEP);
        let j_max = Math.floor((HEIGHT - Y0) / GRID_STEP);
        for (let i = i_min; i <= i_max; i++) {
            let y1 = -Y0;
            let y2 = HEIGHT - Y0;
            let x = i * GRID_STEP;
            g.moveTo(x, y1).lineTo(x, y2);
        }
        for (let j = j_min; j <= j_max; j++) {
            let x1 = -X0;
            let x2 = WIDTH - X0;
            let y = j * GRID_STEP;
            g.moveTo(x1, y).lineTo(x2, y);
        }
    }

    draw_empty_grid() {
        let g = this._grid.graphics;
        g.clear();

        g.beginFill('white').drawRect(-X0, -Y0, WIDTH, HEIGHT).endFill();
    }

    get display_object() {
        return this._display_object;
    }

    get ed() {
        return this._ed;
    }

    get allow_move() {
        return this._allow_move;
    }

    set allow_move(value) {
        this._allow_move = value;
    }

    set grid_visible(value) {
        if (value)
            this.draw_grid();
        else
            this.draw_empty_grid();
    }
}

class SetView {
    _set = null;
    _change_listener;
    _views = [];
    _layer = new createjs.Container();
    _set_element_2_view;

    constructor(view_container, set_element_2_view) {
        this._change_listener = () => this.draw_set_elements();
        this._set_element_2_view = set_element_2_view;

        view_container.addChild(this._layer);
    }

    get set() {
        return this._set;
    }

    set set(value) {
        if (this._set === value)
            return;

        if (this._set !== null)
            this._set.ed.remove_listener('change', this._change_listener);

        this._set = value;
        this.draw_set_elements();

        if (this._set !== null)
            this._set.ed.add_listener('change', this._change_listener);
    }

    draw_set_elements() {
        for (let view of this._views)
            this._layer.removeChild(view.display_object);

        this._views = [];
        if (this._set !== null)
            for (let set_element of this._set) {
                let view = this._set_element_2_view(set_element);
                this._views.push(view);
                this._layer.addChild(view.display_object);
            }
    }
}

export class GridClickEvent extends Event {

    _natural_position; // {x, y}

    constructor(source, natural_position) {
        super('grid click', source);
        this._natural_position = natural_position;
    }

    get natural_position() {
        return this._natural_position;
    }
}