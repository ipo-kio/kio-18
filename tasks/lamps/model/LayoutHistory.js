import {Sequence} from "./devices/Sequence";

export const STEPS = 80;

export const SEQ_BOTH_o2num = ([a, b, c, d, e, f]) => {
    return 32 * a + 16 * b + 8 * c + 4 * d + 2 * e + f;
};

export const SEQ_UNION_o2num = ([a, b, c, d, e, f]) => {
    return 4 * (a | d) + 2 * (b | e) + (c | f);
};

export const SEQ_1st_o2num = ([a, b, c, d, e, f]) => {
    return 4 * a + 2 * b + c;
};

export const SEQ_2nd_o2num = ([a, b, c, d, e, f]) => {
    return 4 * d + 2 * e + f;
};

export class LayoutHistory {

    _layouts = [];

    constructor(initial_layout) {
        this._layouts.push(initial_layout);
        for (let i = 1; i <= STEPS; i++) {
            let prev_layout = this._layouts[i - 1];
            let next_layout = prev_layout.next_layout();

            this._layouts.push(next_layout);
        }
    }

    get(index) {
        if (index < 0)
            index = 0;
        if (index > STEPS)
            index = STEPS;
        return this._layouts[index];
    }

    get_sequence(o2num) {
        let seq = new Sequence(o2num);

        for (let i = 0; i <= STEPS; i++)
            seq.add_next(this.get(i).sequence_element);

        return seq;
    }
}