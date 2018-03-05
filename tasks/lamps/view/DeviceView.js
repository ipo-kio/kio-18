import {BatteryDevice} from "../model/devices/BatteryDevice";
import {ControllerDevice} from "../model/devices/ControllerDevice";
import {LampDevice} from "../model/devices/LampDevice";
import {ResistanceDevice} from "../model/devices/ResistanceDevice";
import {RotatedDevice} from "../model/devices/RotatedDevice";
import {UpDownDevice} from "../model/devices/UpDownDevice";
import {WireDevice} from "../model/devices/WireDevice1";
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./LayoutView";
import {Terminal} from "../model/Terminal";

export class DeviceView {

    _device_with_position;
    _display_object;
    _layout_view;

    _main_do;
    _hit_area;

    constructor(layout_view, device_with_position) {
        this._device_with_position = device_with_position;
        this._device_with_position.add_listener('change', () => this._reposition());

        this._layout_view = layout_view;

        this._display_object = new createjs.Container();
        this._redraw();
        this._reposition();
        this._init_interaction();
    }

    _redraw() {
        let device = this._device_with_position.device;
        let info = this._layout_view.layout.get_info(device);
        let _do = this._create_display_object(device, info);

        this._hit_area = this._init_hit_area();
        this._display_object.removeAllChildren();
        this._display_object.addChild(this._hit_area);
        this._display_object.addChild(_do);
        _do.mouseEnabled = true;
        _do.hitArea = this._hit_area;
        this._hit_area.visible = false;

        this._main_do = _do;
    }

    _reposition() {
        let {x, y} = this._device_with_position.terminal;
        this._display_object.x = GAP + x * TERMINAL_DISTANCE;
        this._display_object.y = GAP + y * TERMINAL_DISTANCE;

        // this.display_object.hitArea.x = this._display_object.x;
        // this.display_object.hitArea.y = this._display_object.y;
    }

    _get_resource(id) {
        return this._layout_view.kioapi.getResource(id);
    }

    _create_display_object(device, device_info) {
        let d;
        if (device instanceof BatteryDevice) {
            d = new createjs.Shape();
            let g = d.graphics;
            g.beginStroke('blue').setStrokeStyle(1).beginFill('blue');
            g.rect(8, -4, TERMINAL_DISTANCE - 16, 8);
            g.moveTo(0, 0).lineTo(8, 0);
            g.moveTo(TERMINAL_DISTANCE - 8, 0).lineTo(TERMINAL_DISTANCE, 0);
        } else if (device instanceof ControllerDevice) {
            d = new createjs.Bitmap(this._get_resource(device.is_on() ? 'c_on' : 'c_off'));
            d.regX = 4;
            d.regY = 4;
        } else if (device instanceof LampDevice) {
            if (!device_info)
                device_info = {power: 0};

            d = new createjs.Container();
            let is_on = device_info.power > 1e-4;

            let res = this._get_resource(is_on ? 'lamp_on' : 'lamp_off');
            let img = new createjs.Bitmap(res);
            img.regX = 4;
            img.regY = res.height / 2;
            d.addChild(img);

            if (is_on) {
                let circle = new createjs.Shape();
                circle.x = res.width / 2 - img.regX;
                circle.y = 0;
                d.addChild(circle);

                let big = device_info.power;
                if (big > 1)
                    big = 1;

                circle.graphics
                    .beginRadialGradientFill([device.color(big), device.color(0)], [0, 1], 0, 0, 0, 0, 0, TERMINAL_DISTANCE)
                    .drawCircle(0, 0, TERMINAL_DISTANCE);
            }
        } else if (device instanceof ResistanceDevice) {
            d = new createjs.Shape();
        } else if (device instanceof RotatedDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.scaleY *= -1;
            prerotated_d.rotation += 90;

            d = new createjs.Container();
            d.addChild(prerotated_d);
        } else if (device instanceof UpDownDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.scaleY *= -1;

            prerotated_d.y += (prerotated_device.height - 1) * TERMINAL_DISTANCE / 2;

            d = new createjs.Container();
            d.addChild(prerotated_d);
        } else if (device instanceof WireDevice) {
            d = new createjs.Shape();
            let g = d.graphics;
            g.setStrokeStyle(1).beginStroke("black");
            g.moveTo(0, 0);
            g.lineTo(TERMINAL_DISTANCE, 0);
        }

        return d;
    }

    get display_object() {
        return this._display_object;
    }

    _init_hit_area() {
        let ha = new createjs.Shape();
        let g = ha.graphics;
        let w = this._device_with_position.device.width - 1;
        let h = this._device_with_position.device.height - 1;
        let td = TERMINAL_DISTANCE / 2;

        g.beginFill("rgba(227, 172, 20, 0.3)");
        g.moveTo(0, 0);
        for (let i = 0; i < w; i++) {
            g.lineTo(td * (2 * i + 1), -td);
            g.lineTo(td * (2 * i + 2), 0);
        }
        for (let j = 0; j < h; j++) {
            g.lineTo(w + td, td * (2 * j + 1));
            g.lineTo(w, td * (2 * j + 2));
        }
        for (let i = w - 1; i >= 0; i--) {
            g.lineTo(td * (2 * i + 1), td);
            g.lineTo(td * 2 * i, 0);
        }
        for (let j = h - 1; j >= 0; j--) {
            g.lineTo(-td, td * (2 * j + 1));
            g.lineTo(0, td * 2 * j);
        }
        g.closePath();

        return ha;
    }

    _press_x;
    _press_y;

    _init_interaction() {
        this.display_object.addEventListener('mousedown', e => {
            this._press_x = e.localX;
            this._press_y = e.localY;
        });
        this.display_object.addEventListener('pressmove', e => {
            let x = this.display_object.x + e.localX;
            let y = this.display_object.y + e.localY;

            this.display_object.x = x - this._press_x;
            this.display_object.y = y - this._press_y;
        });
        this.display_object.addEventListener('pressup', e => {
            let x = this.display_object.x;
            let y = this.display_object.y;

            x = Math.round((x - GAP) / TERMINAL_DISTANCE);
            y = Math.round((y - GAP) / TERMINAL_DISTANCE);

            let lw = this._layout_view.layout.width;
            let lh = this._layout_view.layout.width;

            let dw = this._device_with_position.device.width;
            let dh = this._device_with_position.device.height;

            if (x > lw - dw)
                x = lw - dw;
            if (x < 0)
                x = 0;

            if (y > lh - dh)
                y = lh - dh;
            if (y < 0)
                y = 0;

            this._device_with_position.terminal = new Terminal(x, y);
            // this._reposition();
        });
        this.display_object.addEventListener('rollover', () => this.highlighted = true);
        this.display_object.addEventListener('rollout', () => this.highlighted = false);
    }

    get highlighted() {
        return this._hit_area.visible;
    }

    set highlighted(value) {
        this._hit_area.visible = value;
    }
}