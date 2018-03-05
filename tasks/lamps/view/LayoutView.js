import {DeviceView} from "./DeviceView";

export const TERMINAL_DISTANCE = 34;
export const GAP = 8;

export class LayoutView {

    _layout;

    _display_object;
    _terminals_layer = new createjs.Shape();
    _devices_layer = new createjs.Container;
    _device_views = [];

    _kioapi;

    constructor(layout, kioapi) {
        this._layout = layout;
        this._kioapi = kioapi;

        this._init_display_object();
        this._redraw();

        layout.add_listener('element change', () => {
            this._redraw_all_devices();
        });
        layout.add_listener('change', () => {
            this._redevice_all_devices();
            this._redraw_all_devices();
        });
        this._redevice_all_devices();
    }

    _add_device(device_with_position) {
        let dv = new DeviceView(this, device_with_position);
        this._device_views.push(dv);
        this._devices_layer.addChild(dv.display_object);
        // this._devices_layer.addChild(dv.display_object.hitArea);
    }

    _init_display_object() {
        this._display_object = new createjs.Container();
        this._display_object.addChild(this._terminals_layer);
        this._display_object.addChild(this._devices_layer);
    }

    _redraw() {
        let g = this._terminals_layer.graphics;

        g.clear();

        for (let x = 0; x < this._layout.width; x++)
            for (let y = 0; y < this._layout.height; y++) {
                let x_pos = GAP + x * TERMINAL_DISTANCE;
                let y_pos = GAP + y * TERMINAL_DISTANCE;

                g.beginStroke('black').setStrokeStyle(2);
                g
                    .moveTo(x_pos - 2, y_pos - 2)
                    .lineTo(x_pos - 2, y_pos + 2)
                    .lineTo(x_pos + 2, y_pos + 2)
                    .lineTo(x_pos + 2, y_pos - 2)
                    .closePath();
            }
    }

    get kioapi() {
        return this._kioapi;
    }

    get layout() {
        return this._layout;
    }

    get display_object() {
        return this._display_object;
    }

    _redevice_all_devices() {
        for (let dv of this._device_views)
            this._devices_layer.removeChild(dv);
        this._device_views = [];
        for (let dwp of this._layout.all_devices())
            this._add_device(dwp);
    }

    _redraw_all_devices() {
        for (let dw of this._device_views)
            dw._redraw();
    }
}