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

    remove_object(object) {
        let io = this._objects.indexOf(object);
        if (io < 0)
            throw 'can not remove non-existent element'; //TODO or just ignore

        // object.ed.remove_listener('change', e => this.fire_element_change(object)); //TODO

        this._objects.splice(io, 1);
        this.fire_change();
    }

    clear() {
        this._objects = [];
        this.fire_change();
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

    get length() {
        return this._objects.length;
    }

    get(i) {
        return this._objects[i];
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