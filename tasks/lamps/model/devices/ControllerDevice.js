import {Device} from "./Device";
import {Terminal} from "../Terminal";
import {Connection} from "../Connection";
import {LampConstants} from "../LampConstants";
import {DeviceFactory} from "./device_factory";

export class ControllerDevice extends Device {

    _state; //0, 1, 2, 3, 4, 5
            //.  +  +  .

    constructor(state = 0) {
        super(2, 2);
        this._state = state;
    }

    get_next(currencies) {
        if (Math.abs(currencies[0]) > 1e-6 || this._state > 0) {
            let new_state = this._state + 1;
            if (new_state === LampConstants.C_ON + LampConstants.C_WAIT)
                new_state = 0;
            return DeviceFactory.create_controller(new_state);
        } else
            return DeviceFactory.create_controller();
    }

    is_on() {
        return this._state % (LampConstants.C_ON + LampConstants.C_WAIT) >= LampConstants.C_WAIT;
    }

    get_connections() {
        let c = [
            new Connection(
                new Terminal(0, 1),
                new Terminal(1, 1),
                LampConstants.CONTROLLER_RESISTANCE,
                0
            )
        ];

        if (this.is_on())
            c.push(new Connection(
                new Terminal(0, 0),
                new Terminal(1, 0),
                LampConstants.WIRE_RESISTANCE,
                0
            ));

        return c;
    }

    get copy_and_clear() {
        if (this._state === 0)
            return this;
        else
            return DeviceFactory.create_controller();
    }
}