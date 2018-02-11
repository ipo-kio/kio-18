import {EventDispatcher} from "../EventDispatcher";

export class Spring {

    _first_point_with_position;
    _second_point_with_position;
    _length;
    _ed = new EventDispatcher();

    constructor(first_point_with_position, second_point_with_position, length) {
        if (!first_point_with_position || !second_point_with_position)
            throw "spring points must be both defined";

        this._first_point_with_position = first_point_with_position;
        this._second_point_with_position = second_point_with_position;

        let change_listener = e => this._ed.fire(new Event('change'), this);
        first_point_with_position.ed.add_listener('change', change_listener);
        second_point_with_position.ed.add_listener('change', change_listener);

        this._length = length;
    }


    get first_point_with_position() {
        return this._first_point_with_position;
    }

    get second_point_with_position() {
        return this._second_point_with_position;
    }

    get length() {
        return this._length;
    }

    get ed() {
        return this._ed;
    }
}