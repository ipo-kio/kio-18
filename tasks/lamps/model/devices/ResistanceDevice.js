import {Device} from "./Device";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";

export class ResistanceDevice extends Device {

    _resistance;

    constructor(resistance) {
        super(1, 2);
        this._resistance = resistance;
    }

    get_next() {
        return this;
    }

    get_connections() {
        return [
            new Connection(new Terminal(0, 0), new Terminal(0, 1), this._resistance, 0)
        ];
    }

}