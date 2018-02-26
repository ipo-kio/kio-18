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

    constructor(shape, values=false) {
        this._shape = shape;

        if (values)
            this._values = values;
        else
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
        if (line < 0 || line >= this._shape.length)
            return -1;

        let {from, to} = this.line_borders(line);

        if (index < from || index > to)
            return -1;

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

    get values() {
        return this._values.slice();
    }

    set values(value) {
        this._values = value.slice();
    }
}

export const RULE_REGIME_EXACT = 0;
export const RULE_REGIME_EXACT_ANY_POSITION = 1;
export const RULE_REGIME_AT_LEAST_ANY_POSITION = 2;
export const RULE_REGIME_AT_MOST_ANY_POSITION = 3;

export const RULE_REGIMES_COUNT = 4;

export class Rule extends HexBoard {
    _center_cell;
    _regime = RULE_REGIME_EXACT;

    constructor(values=false) {
        let shape = rule_shape(RULE_SIZE);
        super(shape, values);

        this._center_cell = new HexagonCell(RULE_SIZE - 1, RULE_SIZE - 1);

        if (!values)
            this.set_value(this._center_cell, 1);
    }

    get center_cell() {
        return this._center_cell;
    }

    get regime() {
        return this._regime;
    }

    set regime(value) {
        this._regime = value;
    }

    next_regime() {
        this._regime++;
        if (this._regime >= RULE_REGIMES_COUNT)
            this._regime = 0;
    }

    get rule_size() {
        // if (RULE_SIZE === 2)
            return 6;
        // else
        //     throw new Error("Unknown rule size");
    }

    // static _1 = new HexagonCell(0, 0);
    // static _2 = new HexagonCell(0, 1);
    // static _4 = new HexagonCell(1, 2);
    // static _5 = new HexagonCell(2, 2);
    // static _6 = new HexagonCell(2, 1);
    // static _7 = new HexagonCell(1, 0);

    get values_list() {
        return [
            // this.value(Rule._1),
            // this.value(Rule._2),
            // this.value(Rule._3),
            // this.value(Rule._4),
            // this.value(Rule._5),
            // this.value(Rule._6),
            this._values[0][0],
            this._values[0][1],
            this._values[1][2],
            this._values[2][2],
            this._values[2][1],
            this._values[1][0]
        ];
    }

    get type_counts() {
        let result = new Array(TYPES_COUNT);
        result.fill(0);
        for (let v of this.values_list)
            result[v - 1]++;
        return result;
    }

    conforms(board, {line, index}) {
        if (this._regime === RULE_REGIME_EXACT) {
            for (let {line: rule_line, index: rule_index} of this.cells()) {
                let dx = rule_line - this._center_cell.line;
                let dy = rule_index - this._center_cell.index;
                if (dx === 0 && dy === 0)
                    continue;
                let rule_v = this.value({line: rule_line, index: rule_index});

                if (rule_v === 0)
                    continue;

                let v = board.value({line: line + dx, index: index + dy});

                if (rule_v !== v)
                    return false;
            }

            return true;
        }

        //count
        let rule_tc = this.type_counts;
        let tc = new Array(TYPES_COUNT);
        tc.fill(0);

        for (let {line: rule_line, index: rule_index} of this.cells()) {
            let dx = rule_line - this._center_cell.line;
            let dy = rule_index - this._center_cell.index;
            if (dx === 0 && dy === 0)
                continue;
            let v = board.value({line: line + dx, index: index + dy});
            if (v >= 0)
                tc[v - 1]++;
        }

        let has_more = false;
        let has_less = false;
        for (let i = 0; i < rule_tc.length; i++) {
            if (rule_tc[i] === 0)
                continue;
            if (tc[i] < rule_tc[i])
                has_less = true;
            if (tc[i] > rule_tc[i])
                has_more = true;
        }

        if (this.regime === RULE_REGIME_AT_MOST_ANY_POSITION)
            return !has_more;
        if (this.regime === RULE_REGIME_AT_LEAST_ANY_POSITION)
            return !has_less;

        return !(has_more || has_less);
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

    equals(other_cell) {
        if (!other_cell)
            return false;
        return this._line === other_cell._line && this._index === other_cell._index;
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