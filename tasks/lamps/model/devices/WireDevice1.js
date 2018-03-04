import {Device} from "./Device";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";
import {LampConstants} from "../LampConstants";

export class WireDevice extends Device {

    _size; //vertical

    constructor(size) {
        super(size, 1);
        this._size = size;
    }

    get_next(array_of_currencies) {
        return this;
    }

    get_connections() {
        return [
            new Connection(
                new Terminal(0, 0),
                new Terminal(this._size - 1, 0),
                LampConstants.WIRE_RESISTANCE,
                0
            )
        ];
    }

}