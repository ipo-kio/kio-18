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

    connectors_graph() {
        
    }
}