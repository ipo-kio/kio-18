import {EventDispatcher, Event} from "../EventDispatcher";

export default class PointSet {

    _ed = new EventDispatcher();
    _points_with_positions = [];

    constructor() {
    }

    add_point_with_position(point_with_position) {
        this._points_with_positions.push(point_with_position);
        this.fire();
    }

    get ed() {
        return this._ed;
    }

    fire() {
        this._ed.fire(new Event('change', this));
    }

    [Symbol.iterator]() {
        return this._points_with_positions.values();
    }
}