import {EventDispatcher, Event} from "../EventDispatcher";

export class SpringSet {

    _ed = new EventDispatcher();
    _springs = [];

    constructor() {
    }

    add_spring(spring) {
        this._springs.push(spring);
        this.fire();
    }

    get ed() {
        return this._ed;
    }

    fire() {
        this._ed.fire(new Event('change', this));
    }

    [Symbol.iterator]() {
        return this._springs.values();
    }
}