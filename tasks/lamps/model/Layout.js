import {Graph} from "./Graph";
import {CurrentMap} from "./CurrentMap";
import {DeviceWithPosition} from "./DeviceWithPosition";
import {Event, EventDispatcherInterface} from "../view/EventDispatcherMixin";

export class Layout extends EventDispatcherInterface {
    _width;
    _height;

    _devices_with_positions = [];
    _devices_connections;
    _current_map;

    _device_2_info = new Map();

    constructor(width, height) {
        super();
        this._width = width;
        this._height = height;

        this._refresh();
    }

    __device_changed_listener = e => {
        this._refresh();
        let event = new Event('element change', this);
        event.element = e.source;
        this.fire(event);
    };

    add_device_with_position(device_with_position) {
        this._devices_with_positions.push(device_with_position);
        device_with_position.add_listener('change', this.__device_changed_listener);

        this._refresh();
        this.fire(new Event('change', this));
    }

    add_devices_with_position(devices_with_position) {
        for (let device_with_position of devices_with_position) {
            this._devices_with_positions.push(device_with_position);
            device_with_position.add_listener('change', this.__device_changed_listener);
        }

        this._refresh();
        this.fire(new Event('change', this));
    }

    remove_device_with_position(device_with_position) {
        let ind = this._devices_with_positions.indexOf(device_with_position);
        if (ind >= 0) {
            this._devices_with_positions.splice(ind, 1);
            device_with_position.remove_listener('change', this.__device_changed_listener);
            this._refresh();
            this.fire(new Event('change', this));
        }
    }

    clear_all_devices_with_position() {
        for (let dwp of this._devices_with_positions)
            dwp.remove_listener('change', this.__device_changed_listener);
        this._devices_with_positions = [];
        this.fire(new Event('change', this));
        this._refresh();
    }

    _refresh() {
        let connectors_graph = this._connectors_graph();
        this._current_map = new CurrentMap(connectors_graph);

        this._eval_devices_info();
    }

    *all_devices() {
        yield* this._devices_with_positions;
    }

    _connectors_graph() {
        function tag({x, y}) {
            return x + ':' + y;
        }

        let g = new Graph();
        for (let x = 0; x < this._width; x++)
            for (let y = 0; y < this._height; y++)
                g.add_vertex(tag({x, y}));

        let devices_connections = [];
        for (let device of this._devices_with_positions) {
            let device_connections = [];
            for (let con of device.get_connections()) {
                let t1 = con.terminal1;
                let t2 = con.terminal2;
                g.add_edge(tag(t1), tag(t2), con);
                device_connections.push(con);
            }
            devices_connections.push(device_connections);
        }

        this._devices_connections = devices_connections;

        return g;
    }

    _eval_devices_info() {
        let d = this._devices_with_positions.length;
        for (let i = 0; i < d; i++) {
            let {device} = this._devices_with_positions[i];
            let connections = this._devices_connections[i];

            let currencies = new Array(connections.length);
            for (let j = 0; j < currencies.length; j++)
                currencies[j] = this._current_map.get_current(connections[j]);

            let info = device.get_info(currencies);

            this._device_2_info.set(device, info);
        }
    }

    next_layout() {
        let new_devices_with_positions = new Array(this._devices_with_positions.length);

        let d = this._devices_with_positions.length;
        for (let i = 0; i < d; i++) {
            let {device, terminal} = this._devices_with_positions[i];
            let connections = this._devices_connections[i];

            let currencies = new Array(connections.length);
            for (let j = 0; j < currencies; j++)
                currencies[j] = this._current_map.get(connections[j]);

            let next_device = device.get_next(currencies);

            new_devices_with_positions.push(new DeviceWithPosition(next_device, terminal));
        }

        return new Layout(this._width, this._height, new_devices_with_positions);
    }

    get_info(device) {
        return this._device_2_info.get(device);
    }

    copy() {
        let layout = new Layout(this._width, this._height);
        layout.add_devices_with_position(this._devices_with_positions);
        return layout;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}