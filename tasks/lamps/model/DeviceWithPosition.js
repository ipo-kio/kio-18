import {Connection} from "./Connection";
import {Terminal} from "./Terminal";

export class DeviceWithPosition {

    _device;
    _terminal;

    constructor(device, terminal) {
        this._device = device;
        this._terminal = terminal;
    }

    get device() {
        return this._device;
    }

    get terminal() {
        return this._terminal;
    }

    get_connections() {
        let result = [];
        for (let c of this._device.get_connections()) {
            let {x: x1, y: y1} = c.terminal1;
            let {x: x2, y: y2} = c.terminal2;
            let {x, y} = this._terminal;
            let t1 = new Terminal(x + x1, y + y1);
            let t2 = new Terminal(x + x2, y + y2);
            result.push(new Connection(t1, t2, c.resistance, c.emf));
        }
        return result;
    }
}