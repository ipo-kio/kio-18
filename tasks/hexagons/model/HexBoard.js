//https://math.stackexchange.com/questions/2254655/hexagon-grid-coordinate-system

//               * * * * * *
//              * o o
//             * o o o
//            *   o o
//           *
//          *

export const RULE_SIZE = 2;
export const TYPES_COUNT = 3; //0 and 1,2,3

export class HexBoard {

    _shape; //array of board lines
    _values;

    constructor(shape) {
        this._shape = shape;

        this.init_values_by_shape();
    }

    init_values_by_shape() {
        this._values = new Array(this._shape.lines);
        for (let i = 0; i < this._shape.length; i++) {
            let {from, to} = this._shape[i];
            this._values[i] = new Array(to - from + 1);
            this._values[i].fill(0); //TODO test this works in IE
        }
    }

    line_borders(line) {
        return this._shape[line]; // from to
    }

    value({line, index}) {
        let {from} = this.line_borders(line);
        return this._values[line][index - from];
    }

    set_value({line, index}, value) {
        let {from} = this.line_borders(line);
        this._values[line][index - from] = value;
    }

    conforms_to_a_rule(rule) {

    }

    get lines() {
        return this._shape.length;
    }

    *cells() {
        for (let line = 0; line < this.lines; line++) {
            let {from, to} = this.line_borders(line);
            for (let index = from; index <= to; index++)
                yield new HexagonCell(line, index);
        }
    }

    coordinate_diapason(sizing) {
        let left = +Infinity;
        let right = -Infinity;
        for (let cell of this.cells()) {
            let {x} = cell.coordinates(sizing);
            if (x < left)
                left = x;
            if (x > right)
                right = x;
        }
        return {left, right};
    }
}

export class Rule extends HexBoard {
    _center_cell;

    constructor() {
        let shape = rule_shape(RULE_SIZE);
        super(shape);

        this._center_cell = new HexagonCell(RULE_SIZE - 1, RULE_SIZE - 1);
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
            x: sizing.center_distance * (this._index - this._line / 2),
            y: sizing.R * 3 / 2 * this._line
        }
    }
}

export function rectangular_shape(lines, columns, first_is_left=true) {
    let _shape = new Array(lines);
    let delta = first_is_left ? 1 : 0;
    for (let line = 0; line < lines; line++) {
        let from = Math.floor((line + delta) / 2);       // 0 0 1 1 2 2 3 3
        let to = columns - (line + 1 + delta) % 2;

        _shape[line] = {from, to: from + to - 1};
    }

    return _shape;
}

export function rule_shape(r) {
    let _shape = new Array(2 * r - 1);
    for (let i = 0; i < r; i++)
        _shape[i] = {from: 0, to: r - 1 + i};
    for (let i = r; i < 2 * r - 1; i++)
        _shape[i] = {from: i - r + 1, to: 2 * r - 2};

    return _shape;
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