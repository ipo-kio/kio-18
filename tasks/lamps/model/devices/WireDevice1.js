import {Device} from "./Device";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";
import {LampConstants} from "../LampConstants";

export class WireDevice extends Device {

    _size; //vertical

    constructor(size) {
        super(1, size);
        this._size = size;
    }

    get_next(array_of_currencies) {
        return this;
    }

    get_connections() {
        return [
            new Connection(
                new Terminal(0, 0),
                new Terminal(0, this._size - 1),
                LampConstants.LAMP_RESISTANCE,
                0
            )
        ];
    }

}