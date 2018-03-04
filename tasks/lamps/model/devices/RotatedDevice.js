import {Device} from "./Device";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";

export class RotatedDevice extends Device {

    _device;

    constructor(device) {
        super(device.height, device.width);
        this._device = device;
    }

    get_next(array_of_currencies) {
        return new RotatedDevice(this._device.get_next(array_of_currencies));
    }

    get_connections() {
        let connections = [];
        for (let c of this._device.get_connections()) {
            let {x: x1, y: y1} = c.terminal1;
            let {x: x2, y: y2} = c.terminal2;
            connections.push(new Connection(new Terminal(y1, x1), new Terminal(y2, x2), c.resistance, c.emf));
        }
        return connections;
    }
}