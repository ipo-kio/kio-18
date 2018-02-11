import {EventDispatcher} from "../EventDispatcher";
import {NATURAL_X_MIN, NATURAL_X_MAX, NATURAL_Y_MAX, NATURAL_Y_MIN, GRID_STEP_SIZE} from "../view/GridView";

export class Point {
    _weight;

    constructor(weight) {
        this._weight = weight;
    }


    get weight() {
        return this._weight;
    }
}

export class PointWithPosition {
    _x;
    _y;
    _point;
    _ed = new EventDispatcher();

    constructor(x, y, point) {
        this._x = x;
        this._y = y;
        this._point = point;
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

    get point() {
        return this._point;
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
}