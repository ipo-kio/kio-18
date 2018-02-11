import {EventDispatcher, Event} from "../EventDispatcher";

export default class ObjectsSet {

    _ed = new EventDispatcher();
    _objects = [];

    constructor() {
    }

    add_object(object) {
        this._objects.push(object);
        this.fire_change();
        object.ed.add_listener('change', e => this.fire_element_change(object));
    }

    get ed() {
        return this._ed;
    }

    fire_change() {
        this._ed.fire(new Event('change', this));
    }

    fire_element_change(object) {
        let event = new ElementChangeEvent(this, object);
        this._ed.fire(event);
    }

    [Symbol.iterator]() {
        return this._objects.values();
    }
}

class ElementChangeEvent extends Event {
    _element;

    constructor(source, element) {
        super('element change', source);
        this._element = element;
    }

    get element() {
        return this._element;
    }
}