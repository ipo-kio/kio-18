export class Spring {

    _first_point_with_position;
    _second_point_with_position;
    _length;

    constructor(first_point_with_position, second_point_with_position, length) {
        this._first_point_with_position = first_point_with_position;
        this._second_point_with_position = second_point_with_position;
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
}