import {EventDispatcher} from "../EventDispatcher";

export class Spring {

    _points_set;
    _first_point_with_position_index;
    _second_point_with_position_index;
    _length;
    _ed = new EventDispatcher();

    constructor(points_set, first_point_with_position_index, second_point_with_position_index, length) {
        this._points_set = points_set;
        this._first_point_with_position_index = first_point_with_position_index;
        this._second_point_with_position_index = second_point_with_position_index;

        let change_listener = () => this._ed.fire(new Event('change'), this);
        this.first_point_with_position.ed.add_listener('change', change_listener);
        this.second_point_with_position.ed.add_listener('change', change_listener);

        this._length = length;
    }

    get first_point_with_position() {
        return this._points_set.get(this._first_point_with_position_index);
    }

    get second_point_with_position() {
        return this._points_set.get(this._second_point_with_position_index);
    }

    get first_point_with_position_index() {
        return this._first_point_with_position_index;
    }

    get second_point_with_position_index() {
        return this._second_point_with_position_index;
    }

    get length() {
        return this._length;
    }

    get ed() {
        return this._ed;
    }
}