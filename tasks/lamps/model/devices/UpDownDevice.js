import {Device} from "./Device";
import {Connection} from "../Connection";
import {Terminal} from "../Terminal";
import {DeviceFactory} from "./device_factory";

export class UpDownDevice extends Device {

    _device;

    constructor(device) {
        super(device.width, device.height);
        this._device = device;
    }

    get_next(array_of_currencies) {
        return new UpDownDevice(this._device.get_next(array_of_currencies));
    }

    get_connections() {
        let connections = [];
        for (let c of this._device.get_connections()) {
            let {x: x1, y: y1} = c.terminal1;
            let {x: x2, y: y2} = c.terminal2;
            connections.push(new Connection(
                new Terminal(this._device.width - x1 - 1, this._device.height - y1 - 1),
                new Terminal(this._device.width - x2 - 1, this._device.height - y2 - 1),
                c.resistance,
                c.emf
            ));
        }
        return connections;
    }

    get_info(array_of_currencies) {
        return this._device.get_info(array_of_currencies);
    }

    get copy_and_clear() {
        return DeviceFactory.create_updown(this._device.copy_and_clear);
    }
}