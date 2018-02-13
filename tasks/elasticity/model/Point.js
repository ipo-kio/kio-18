export class Point {
    _weight;

    constructor(weight) {
        this._weight = weight;
    }

    get weight() {
        return this._weight;
    }
}