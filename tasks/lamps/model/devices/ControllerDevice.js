import {Device} from "./Device";
import {Terminal} from "../Terminal";
import {Connection} from "../Connection";
import {LampConstants} from "../LampConstants";

export class ControllerDevice extends Device {

    _state; //0, 1, 2, 3, 4, 5
            //.  +  +  .

    constructor(state = 0) {
        super(2, 2);
        this._state = state;
    }

    get_next(currencies) {
        if (currencies[0] > 1e-6)
            return new ControllerDevice(this._state + 1);
        else
            return new ControllerDevice(0);
    }

    is_on() {
        return this._state % 3 > 0;
    }

    get_connections() {
        let c = [
            new Connection(
                new Terminal(0, 0),
                new Terminal(1, 0),
                LampConstants.WIRE_RESISTANCE,
                0
            )
        ];

        if (this.is_on())
            c.push(new Connection(
                new Terminal(0, 1),
                new Terminal(1, 1),
                LampConstants.WIRE_RESISTANCE,
                0
            ));
    }

}