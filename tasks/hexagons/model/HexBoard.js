//https://math.stackexchange.com/questions/2254655/hexagon-grid-coordinate-system

//               * * * * * *
//              * o o
//             * o o o
//            *   o o
//           *
//          *

import {Graph} from "../../lamps/model/Graph";

export const RULE_SIZE = 2;
export const TYPES_COUNT = 4; //0 and 1,2,3,4

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
        return this.value_by_ints(line, index);
    }

    value_by_ints(line, index) {
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

    get shape() {
        return this._shape;
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

    static _deep_copy_array(a) {
        let b = new Array(a.length);
        for (let i = 0; i < a.length; i++)
            b[i] = a[i].slice();
        return b;
    }

    get values() {
        return HexBoard._deep_copy_array(this._values);
    }

    set values(value) {
        this._values = HexBoard._deep_copy_array(value);
    }

    hash_code() {
        let h = 0;
        let i = 0;
        for (let i = 0; i < this._values.length; i++) {
            let line = this._values[i];
            for (let j = 0; j < line.length; j++)
                h = (h << 5) - h + line[j] | 0; // "| 0" means -> to int32
        }

        return h;
    }

    equals(that) {
        for (let i = 0; i < this._values.length; i++) {
            let line = this._values[i];
            let that_line = that._values[i];
            for (let j = 0; j < line.length; j++)
                if (line[j] !== that_line[j])
                    return false;
        }
        return true;
    }

    colored_cells() {
        let cnt = 0;
        for (let i = 0; i < this._values.length; i++) {
            let line = this._values[i];
            for (let j = 0; j < line.length; j++)
                if (line[j] >= 1)
                    cnt++;
        }
        return cnt;
    }

    parts() { //returns {parts, n} number of parts and number of vertices
        function tag(line, index) {
            return line + ':' + index;
        }

        let g = new Graph(); //TODO this is a graph from another task
        // add vertices
        let n = 0;
        for (let {line, index} of this.cells())
            if (this.value_by_ints(line, index) > 1) {
                n++;
                g.add_vertex(tag(line, index));
            }

        //add edges
        let test = (l1, i1, l2, i2) => {
            let b = this.value_by_ints(l2, i2);
            if (b > 1)
                g.add_edge(tag(l1, i1), tag(l2, i2), 42);
        };

        for (let {line, index} of this.cells()) {
            let a = this.value_by_ints(line, index);
            if (a > 1) {
                test(line, index, line, index + 1);
                test(line, index + 1, line, index + 1);
                test(line, index + 1, line, index);
            }
        }

        let {colors} = g.kraskal();
        let colors_counts = new Array(colors.length);
        colors_counts.fill(0);
        for (let i = 0; i < colors.length; i++)
            colors_counts[colors[i]]++;
        let parts = 0;
        for (let i = 0; i < colors_counts.length; i++)
            if (colors_counts[i] > 0)
                parts++;

        return {parts, n};
    }

}

export const RULE_REGIME_EXACT = 0;
export const RULE_REGIME_EXACT_ANY_POSITION = 1;
export const RULE_REGIME_AT_LEAST_ANY_POSITION = 2;
export const RULE_REGIME_AT_MOST_ANY_POSITION = 3;

export const RULE_REGIMES_COUNT = 4;

export class Rule extends HexBoard {
    _center_cell;
    _result_cell;
    _regime;

    constructor(values=false, regime=RULE_REGIME_EXACT) {
        let shape = rule_shape(RULE_SIZE);
        super(shape, values);

        this._center_cell = new HexagonCell(RULE_SIZE - 1, RULE_SIZE - 1);
        this._result_cell = new HexagonCell(3, 1);
        this._regime = regime;

        if (!values)
            this.set_value(this._result_cell, 1);
    }

    get center_cell() {
        return this._center_cell;
    }

    get result_cell() {
        return this._result_cell;
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

    get value_to_set() {
        return this.value(this.result_cell);
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
            this._values[2][1],
            this._values[2][0],
            this._values[1][0]
        ];
    }

    get type_counts() {
        let result = new Array(TYPES_COUNT);
        result.fill(0);
        for (let v of this.values_list)
            if (v !== 0)
                result[v - 1]++;
        return result;
    }

    conforms(board, {line, index}) {
        //test center cell in any situation
        let rule_center_value = this.value(this.center_cell);
        if (rule_center_value !== 0) {
            let board_center_value = board.value_by_ints(line, index);
            if (rule_center_value !== board_center_value)
                return false;
        }

        if (this._regime === RULE_REGIME_EXACT) {
            let rule_vals = this.values_list;
            let board_vals = [
                board.value_by_ints(line - 1, index - 1),
                board.value_by_ints(line - 1, index),
                board.value_by_ints(line, index + 1),
                board.value_by_ints(line + 1, index + 1),
                board.value_by_ints(line + 1, index),
                board.value_by_ints(line, index - 1)
            ];

            //[...x6], [...x6]
            for (let dir = -1; dir <= 1; dir += 2)
                for (let delta = 0; delta < 6; delta++) {
                    let ok = true;
                    for (let i = 0; i < 6; i++) {
                        if (rule_vals[i] === 0)
                            continue;
                        let j = i * dir + delta;
                        while (j < 0) j += 6;
                        while (j >= 6) j -= 6;
                        if (rule_vals[i] !== board_vals[j]) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok)
                        return true;
                }

            return false;
        }

        //count
        let rule_tc = this.type_counts;
        let tc = new Array(TYPES_COUNT);
        tc.fill(0);

        for (let {line: rule_line, index: rule_index} of this.cells()) {
            let dx = rule_line - this._center_cell.line;
            let dy = rule_index - this._center_cell.index;
            if (dx === 0 && dy === 0 || dx === this._result_cell.line - this._center_cell.line && dy === this._result_cell.index - this._center_cell.index)
                continue;
            let v = board.value_by_ints(line + dx, index + dy);
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

    toString() {
        function r(rr) {
            switch (rr) {
                case RULE_REGIME_EXACT: return 'e';
                case RULE_REGIME_EXACT_ANY_POSITION: return '=';
                case RULE_REGIME_AT_LEAST_ANY_POSITION: return '>';
                case RULE_REGIME_AT_MOST_ANY_POSITION: return '<';
            }
        }
        let result = '';
        for (let v of this.values_list)
            result += v;
        return result + ' -> ' + this.value(this._center_cell) + r(this.regime);
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

    _shape.push({from: 1, to: 1});

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