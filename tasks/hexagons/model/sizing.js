export const sin60 = Math.sqrt(3) / 2;
export const sin30 = 1 / 2;

export class Sizing {

    _R;

    constructor(R) {
        this._R = R;
    }

    get R() {
        return this._R;
    }

    get H() {
        return sin60 * this._R;
    }

    get center_distance() {
        return 2 * this._R;
    }
}