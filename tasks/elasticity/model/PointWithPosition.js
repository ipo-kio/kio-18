import {EventDispatcher} from "../EventDispatcher";
import {NATURAL_X_MIN, NATURAL_X_MAX, NATURAL_Y_MAX, NATURAL_Y_MIN, GRID_STEP_SIZE} from "../view/GridView";
import {point_types} from "./point_types";

export class PointWithPosition {
    _x;
    _y;
    _point_type_ind;
    _ed = new EventDispatcher();

    constructor(x, y, _point_type_ind) {
        this._x = PointWithPosition.normalize_x(x);
        this._y = PointWithPosition.normalize_y(y);
        this._point_type_ind = _point_type_ind;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    set x(value) {
        value = PointWithPosition.normalize_x(value);

        if (this._x === value)
            return;
        this._x = value;
        this.fire();
    }

    set y(value) {
        value = PointWithPosition.normalize_y(value);

        if (this._y === value)
            return;
        this._y = value;
        this.fire();
    }

    set_location({x, y}) {
        x = PointWithPosition.normalize_x(x);
        y = PointWithPosition.normalize_y(y);

        if (this._x === x && this._y === y)
            return;
        this._x = x;
        this._y = y;
        this.fire();
    }

    set_location_without_normalization({x, y}) {
        this._x = x;
        this._y = y;
        this.fire();
    }

    get point_type_ind() {
        return this._point_type_ind;
    }

    get point_type() {
        return point_types[this._point_type_ind];
    }

    get point() {
        return this.point_type.type;
    }

    get ed() {
        return this._ed;
    }

    fire() {
        this._ed.fire(new Event('change', this));
    }

    static normalize_x(x) {
        x = Math.round(x / GRID_STEP_SIZE) * GRID_STEP_SIZE;

        if (x < NATURAL_X_MIN)
            x = NATURAL_X_MIN;

        if (x > NATURAL_X_MAX)
            x = NATURAL_X_MAX;

        return x;
    }

    static normalize_y(y) {
        y = Math.round(y / GRID_STEP_SIZE) * GRID_STEP_SIZE;

        if (y < NATURAL_Y_MIN)
            y = NATURAL_Y_MIN;

        if (y > NATURAL_Y_MAX)
            y = NATURAL_Y_MAX;

        return y;
    }

    distance2({x, y}) {
        let dx = this._x - x;
        let dy = this._y - y;

        return dx * dx + dy * dy;
    }

    distance(p) {
        return Math.sqrt(this.distance2(p));
    }
}