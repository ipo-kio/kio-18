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
            x: sizing.center_distance * (this._index - this._line / 2),
            y: sizing.center_distance * this._line
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

    console.log(_shape);
    return _shape;
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