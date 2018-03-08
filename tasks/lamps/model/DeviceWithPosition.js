import {Connection} from "./Connection";
import {Terminal} from "./Terminal";
import {EventDispatcherInterface, Event} from "../view/EventDispatcherMixin";
import {DeviceFactory} from "./devices/device_factory";

export class DeviceWithPosition extends EventDispatcherInterface {

    // 950-(046)-7373, 980-99-32 Сервис Макс
    // 111 военный завод. 387-8362, 367-64-28

    _device;
    _terminal;

    constructor(device, terminal) {
        super();
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

    set terminal(t) {
        if (this._terminal.x === t.x && this._terminal.y === t.y)
            return;

        this._terminal = t;
        this.fire(new Event('change', this));
    }

    set device(d) {
        if (this._device === d)
            return;
        this._device = d;
        this.fire(new Event('change'), this);
    }

    get serializer() {
        return [DeviceFactory.serialize(this._device), this._terminal.x, this._terminal.y];
    }
}