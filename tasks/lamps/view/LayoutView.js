import {DeviceView} from "./DeviceView";

export const TERMINAL_DISTANCE = 34;
export const GAP = 8;

export class LayoutView {

    _layout;
    _canvas;

    _stage;
    _terminals_layer = new createjs.Shape();
    _devices_layer = new createjs.Container;
    _device_views = [];

    _kioapi;

    constructor(layout, kioapi) {
        this._layout = layout;
        this._kioapi = kioapi;

        this._init_canvas();

        this._redraw();

        // layout.add_listener('element change', () => {
        //
        // });
        layout.add_listener('change', () => {
            for (let dv of this._device_views)
                this._devices_layer.removeChild(dv);
            this._device_views = [];
            for (let dwp of layout.all_devices())
                this._add_device(dwp);
        });
    }

    _add_device(device_with_position) {
        let dv = new DeviceView(this, device_with_position);
        this._device_views.push(dv);
        this._devices_layer.addChild(dv._display_object);
    }

    _init_canvas() {
        this._canvas = document.createElement('canvas');
        this._canvas.width = (this._layout.width - 1) * TERMINAL_DISTANCE + 2 * GAP;
        this._canvas.height = (this._layout.height - 1) * TERMINAL_DISTANCE + 2 * GAP;
        this._canvas.className = 'kio-lamps-canvas';

        this._stage = new createjs.Stage();
        this._stage.addChild(this._terminals_layer);
        this._stage.addChild(this._devices_layer);
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
                    .lineTo(x_pos - 2, y_pos - 2)
                    .closePath();
            }
    }

    get kioapi() {
        return this._kioapi;
    }

    get layout() {
        return this._layout;
    }

    get canvas() {
        return this._canvas;
    }
}