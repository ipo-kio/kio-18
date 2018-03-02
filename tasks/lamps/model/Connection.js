export class Connection {

    _terminal1;
    _terminal2;
    _resistance;

    constructor(terminal1, terminal2, resistance) {
        this._terminal1 = terminal1;
        this._terminal2 = terminal2;
        this._resistance = resistance;
    }

    get terminal1() {
        return this._terminal1;
    }

    get terminal2() {
        return this._terminal2;
    }

    get resistance() {
        return this._resistance;
    }
}