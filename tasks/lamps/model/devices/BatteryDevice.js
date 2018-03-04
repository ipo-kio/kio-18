import {Device} from "./Device";
import {Terminal} from "../Terminal";
import {Connection} from "../Connection";
import {LampConstants} from "../LampConstants";

export class BatteryDevice extends Device {

    constructor() {
        super(2, 1);
    }

    get_next(currencies) {
        return this;
    }

    get_connections() {
        return [
            new Connection(
                new Terminal(0, 0),
                new Terminal(1, 0),
                LampConstants.BATTERY_RESISTANCE,
                LampConstants.BATTERY_EMF
            )
        ];
    }
}