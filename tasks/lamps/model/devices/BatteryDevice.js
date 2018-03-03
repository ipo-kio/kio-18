import {Device} from "./Device";
import {Terminal} from "../Terminal";
import {Connection} from "../Connection";
import {LampConstants} from "../LampConstants";

export class BatteryDevice extends Device {

    _emf;

    constructor(emf) {
        super(2, 1);
        this._emf = emf;
    }

    get_next() {
        return this;
    }

    get_connections() {
        return [
            new Connection(
                new Terminal(0, 0),
                new Terminal(0, 1),
                LampConstants.BATTERY_RESISTANCE,
                LampConstants.BATTERY_EMF
            )
        ];
    }
}