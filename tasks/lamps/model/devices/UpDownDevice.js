import {Device} from "./Device";
import {RotatedDevice} from "./RotatedDevice";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";

export class UpDownDevice extends Device {

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
            y1 = this._device.height - y1 - 1;
            y2 = this._device.height - y2 - 1;
            connections.push(new Connection(new Terminal(x1, y1), new Terminal(x2, y2), c.resistance, c.emf));
        }
        return connections;
    }

    get_info(array_of_currencies) {
        return this._device.get_info(array_of_currencies);
    }
}