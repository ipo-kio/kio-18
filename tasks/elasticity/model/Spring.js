import {EventDispatcher} from "../EventDispatcher";
import {Constants} from "./constants";

export class Spring {

    _first_point_with_position;
    _second_point_with_position;
    _length;
    _change_listener;
    _ed = new EventDispatcher();

    constructor(first_point_with_position, second_point_with_position) {
        this._first_point_with_position = first_point_with_position;
        this._second_point_with_position = second_point_with_position;

        this._change_listener = () => this.fire();
        this.first_point_with_position.ed.add_listener('change', this._change_listener);
        this.second_point_with_position.ed.add_listener('change', this._change_listener);

        this._length = this.actual_length;
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

    get relative_elongation() {
        let d = this.actual_length;

        let elongation = d - this.length;

        return elongation / this.length;
    }

    relength() {
        this._length = this.actual_length;
        this.fire();
    }

    fire() {
        this._ed.fire(new Event('change'), this);
    }

    get actual_length() {
        let {x: x1, y: y1} = this.first_point_with_position;
        let {x: x2, y: y2} = this.second_point_with_position;

        let dx = x2 - x1;
        let dy = y2 - y1;
        let d2 = dx * dx + dy * dy;
        return Math.sqrt(d2);
    }

    get too_long() {
        return this.length > Constants._MAX_DISTANCE;
    }

}