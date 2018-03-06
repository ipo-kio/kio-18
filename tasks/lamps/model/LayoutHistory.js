export const STEPS = 80;

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

}