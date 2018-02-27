class Nothing {}

export let EventDispatcherMixin = superclass => class extends superclass {

    _listeners = [];

    add_listener(type, listener) {
        this._listeners.push({type, listener});
    }

    remove_listener(type, listener) {
        this._listeners = this._listeners.filter(({t, l}) => !(t === type && l === listener));
    }

    fire(event) {
        for (let {type: t, listener: l} of this._listeners)
            if (event.type === t)
                l(event);
    }
};

export let EventDispatcherInterface = EventDispatcherMixin(Nothing);

export class Event {
    _type;
    _source;

    constructor(type, source) {
        this._type = type;
        this._source = source;
    }

    get type() {
        return this._type;
    }

    get source() {
        return this._source;
    }
}