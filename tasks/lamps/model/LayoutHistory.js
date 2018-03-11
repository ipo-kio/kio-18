import {Sequence} from "./devices/Sequence";

export const STEPS = 60;

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

    get_sequence() {
        let seq = new Sequence();

        for (let i = 0; i <= STEPS; i++) {
            let se = this.get(i).sequence_element;

            if (se === 'no lamps')
                seq.add_next(0);
            else if (se === 'many lamps')
                seq.add_next(-1);
            else
                seq.add_next(se);
        }

        return seq;
    }

    get size() {
        return this._layouts.length;
    }
}