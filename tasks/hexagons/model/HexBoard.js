//https://math.stackexchange.com/questions/2254655/hexagon-grid-coordinate-system

//               * * * * * *
//              * o o
//             * o o o
//            *   o o
//           *
//          *

export class HexBoard {

    _shape; //array of board lines
    _values;

    constructor(shape, values) {
        this._shape = shape;
        this._values = values;
    }

    line_borders(line) {
        return this._shape[line]; // from to
    }

    value({line, index}) {
        let {from} = this.line_borders(line);
        return this._values[line][index - from];
    }

    conforms_to_a_rule(rule) {

    }
}

export class Rule extends HexBoard {
    _center_cell;

    constructor(shape, values, center_cell) {
        super(shape, values);
        this._center_cell = center_cell;
    }

    get center_cell() {
        return this._center_cell;
    }
}

class BoardLine {
    _from;
    _to;

    constructor(from, to) {
        this._from = from;
        this._to = to;
    }

    get from() {
        return this._from;
    }

    get to() {
        return this._to;
    }
}

export class HexagonCell {
    _line;
    _index;

    constructor(line, index) {
        this._line = line;
        this._index = index;
    }

    get line() {
        return this._line;
    }

    get index() {
        return this._index;
    }

    coordinates(sizing) {
        return {
            x: sizing.center_distance * (this._line - this._index / 2),
            y: sizing.center_distance * this._index * Math.sqrt(3) / 2
        }
    }
}

export function create_rectangular_shape(lines, columns /* in shorter lines*/, first_is_left) {

}

export function rule_shape(r) {

}

/*

r = 2
 * *
* * *
 * *

r = 3

   * * *
  * * * *
 * * * * *
  * * * *
   * * *
*/