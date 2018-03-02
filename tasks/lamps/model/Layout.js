export class Layout {
    _width;
    _height;

    _devices_with_positions = [];

    constructor(width, height) {
        this._width = width;
        this._height = height;
    }

    add_device_with_position(device_with_position) {
        this._devices_with_positions.push(device_with_position);
    }
}

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
}