import {EventDispatcher} from "../EventDispatcher";

export class Spring {

    _points_set;
    _first_point_with_position_index;
    _second_point_with_position_index;
    _first_point_with_position;
    _second_point_with_position;
    _length;
    _change_listener;
    _ed = new EventDispatcher();

    constructor(points_set, first_point_with_position_index, second_point_with_position_index, length) {
        this._points_set = points_set;
        this._first_point_with_position_index = first_point_with_position_index;
        this._second_point_with_position_index = second_point_with_position_index;

        this._first_point_with_position = points_set.get(this._first_point_with_position_index);
        this._second_point_with_position = points_set.get(this._second_point_with_position_index);

        this._change_listener = () => this._ed.fire(new Event('change'), this);
        this.first_point_with_position.ed.add_listener('change', this._change_listener);
        this.second_point_with_position.ed.add_listener('change', this._change_listener);

        this._length = length;
    }

    get first_point_with_position() {
        return this._first_point_with_position;
    }

    get second_point_with_position() {
        return this._second_point_with_position;
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

    get relative_elongation() {
        let {x:x1, y:y1} = this.first_point_with_position;
        let {x:x2, y:y2} = this.second_point_with_position;

        let dx = x2 - x1;
        let dy = y2 - y1;
        let d2 = dx * dx + dy * dy;
        let d = Math.sqrt(d2);

        let elongation = d - this.length;

        return elongation / this.length;
    }
}