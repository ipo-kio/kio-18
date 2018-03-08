import {BatteryDevice} from "../model/devices/BatteryDevice";
import {ControllerDevice} from "../model/devices/ControllerDevice";
import {LampDevice} from "../model/devices/LampDevice";
import {ResistanceDevice} from "../model/devices/ResistanceDevice";
import {RotatedDevice} from "../model/devices/RotatedDevice";
import {UpDownDevice} from "../model/devices/UpDownDevice";
import {WireDevice} from "../model/devices/WireDevice1";
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./LayoutView";
import {Terminal} from "../model/Terminal";
import {DeviceWithPosition} from "../model/DeviceWithPosition";
import {DeviceFactory} from "../model/devices/device_factory";

const WIRE_COLOR = "#70747a";

export class DeviceView {

    _device_with_position;
    _display_object;
    _layout_view;

    _main_do;
    _hit_area;

    _stable;

    constructor(layout_view, device_with_position, stable = false) {
        this._device_with_position = device_with_position;
        this._device_with_position.add_listener('change', () => this._reposition());

        this._stable = stable;

        this._layout_view = layout_view;

        this._display_object = new createjs.Container();
        this._redraw();
        this._reposition();
        this._init_interaction();
    }

    _redraw() {
        let device = this._device_with_position.device;
        let info = this._layout_view.layout.get_info(this._device_with_position);
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
            g.beginStroke('#000080').setStrokeStyle(1).beginFill('blue');
            g.rect(8.5, -3.5, (TERMINAL_DISTANCE - 16) / 2, 8);
            g.beginFill('red');
            g.rect(8.5 + (TERMINAL_DISTANCE - 16) / 2, -3.5, (TERMINAL_DISTANCE - 16) / 2, 8);
            g.moveTo(0, 0).lineTo(8, 0);
            g.moveTo(TERMINAL_DISTANCE - 8, 0).lineTo(TERMINAL_DISTANCE, 0);
        } else if (device instanceof ControllerDevice) {
            d = new createjs.Shape();

            let dy = 4;
            let bg_img = this._get_resource(device.is_on() ? 'c_on' : 'c_off');
            let g = d.graphics;
            g
                .beginBitmapFill(
                    bg_img,
                    'no-repeat',
                    new createjs.Matrix2D(1, 0, 0, 1, 0, -dy)
                )
                .rect(0, -dy, bg_img.width, bg_img.height);

            for (let i = 0; i < device.c_wait + device.c_on; i++) {
                let color = i <= device.state ? '#ccc' : '#dd073f';
                let is_empty = i < device.c_wait;
                let xx = i % 3;
                let yy = (i - xx) / 3;
                if (yy === 2)
                    xx = 1;
                let xxx = 10 + xx * 7;
                let yyy = 4 + yy * 11;
                if (is_empty)
                    g.beginStroke(color).beginFill(null);
                else
                    g.beginFill(color).beginStroke(null);
                let d = is_empty ? 0.5 : 0;
                g.rect(xxx + 0.5, yyy + 0.5, 4, 8);
            }


            // d = new createjs.Bitmap(this._get_resource(device.is_on() ? 'c_on' : 'c_off'));
            // d.regX = 0;
            // d.regY = 4;
        } else if (device instanceof LampDevice) {
            if (!device_info)
                device_info = {power: 0.8};

            d = new createjs.Container();
            let is_on = device_info.power > 1e-4;

            let wire = new createjs.Shape();
            let g_wire = wire.graphics;
            g_wire.setStrokeStyle(2).beginStroke(WIRE_COLOR);
            g_wire.moveTo(0, 0);
            let w_wire = (device.width - 1) * TERMINAL_DISTANCE;
            g_wire.bezierCurveTo(w_wire / 3, TERMINAL_DISTANCE / 5, 2 * w_wire / 3, TERMINAL_DISTANCE / 5, w_wire, 0);
            d.addChild(wire);

            let res = this._get_resource(is_on ? 'lamp_on' : 'lamp_off');
            let img = new createjs.Bitmap(res);
            img.regX = res.width / 2;
            img.regY = res.height / 2 + 4;
            img.x = TERMINAL_DISTANCE / 2;
            img.y = 0;

            if (is_on) {
                let circle = new createjs.Shape();
                circle.x = TERMINAL_DISTANCE / 2;
                circle.y = 0;
                d.addChild(circle);

                let big = device_info.power;
                if (big > 1)
                    big = 1;

                circle.graphics
                    .beginRadialGradientFill([device.color(big), device.color(0)], [0, 1], 0, 0, 0, 0, 0, TERMINAL_DISTANCE)
                    .drawCircle(0, 0, TERMINAL_DISTANCE);
                circle.compositeOperation = 'luminosity';
            }

            d.addChild(img);

        } else if (device instanceof ResistanceDevice) {
            d = new createjs.Shape();
        } else if (device instanceof RotatedDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.rotation += 90;
            prerotated_d.x += (prerotated_device.height - 1) * TERMINAL_DISTANCE;

            d = new createjs.Container();
            d.addChild(prerotated_d);
        } else if (device instanceof UpDownDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.scaleY *= -1;
            prerotated_d.scaleX *= -1;

            prerotated_d.x += (prerotated_device.width - 1) * TERMINAL_DISTANCE;
            prerotated_d.y += (prerotated_device.height - 1) * TERMINAL_DISTANCE;

            d = new createjs.Container();
            d.addChild(prerotated_d);
        } else if (device instanceof WireDevice) {
            d = new createjs.Shape();
            let g = d.graphics;
            g.setStrokeStyle(2).beginStroke(WIRE_COLOR);
            g.moveTo(0, 0);
            let w = (device.width - 1) * TERMINAL_DISTANCE;
            g.bezierCurveTo(w / 3, TERMINAL_DISTANCE / 5, 2 * w / 3, TERMINAL_DISTANCE / 5, w, 0);
        }

        return d;
    }

    get display_object() {
        return this._display_object;
    }

    _init_hit_area() {
        let ha = new createjs.Shape();
        let g = ha.graphics;
        let device = this._device_with_position.device;

        let w = device.width - 1;
        let h = device.height - 1;

        let td = TERMINAL_DISTANCE / 2;

        g.beginFill("rgba(227, 172, 20, 0.3)");
        g.moveTo(0, 0);
        for (let i = 0; i < w; i++) {
            g.lineTo(td * (2 * i + 1), -td);
            g.lineTo(td * (2 * i + 2), 0);
        }
        for (let j = 0; j < h; j++) {
            g.lineTo(w * 2 * td + td, td * (2 * j + 1));
            g.lineTo(w * 2 * td, td * (2 * j + 2));
        }
        for (let i = w - 1; i >= 0; i--) {
            g.lineTo(td * (2 * i + 1), h * 2 * td + td);
            g.lineTo(td * 2 * i, h * 2 * td);
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

            if (this._stable) {
                let device_selector = this.display_object.parent;
                let dsx = device_selector.x;
                let dsy = device_selector.y;

                x += dsx;
                y += dsy;
            }

            x = Math.round((x - GAP) / TERMINAL_DISTANCE);
            y = Math.round((y - GAP) / TERMINAL_DISTANCE);

            let lw = this._layout_view.layout.width;
            let lh = this._layout_view.layout.width;

            let dw = this._device_with_position.device.width;
            let dh = this._device_with_position.device.height;

            let xx = x;

            if (x > lw - dw)
                x = lw - dw;
            if (x < 0)
                x = 0;

            if (y > lh - dh)
                y = lh - dh;
            if (y < 0)
                y = 0;

            if (this._stable) {
                if (xx <= lw - dw + 1) {
                    let dwp = new DeviceWithPosition(this._device_with_position.device, new Terminal(x, y));
                    this._layout_view.layout.add_device_with_position(dwp);
                    //count--
                }
                this._reposition();
            } else {
                if (xx >= lw - dw + 1)
                    this._layout_view._remove_device_by_view(this);
                else {
                    this._device_with_position.terminal = new Terminal(x, y);
                    this._reposition();
                }

            }
        });
        this.display_object.addEventListener('rollover', () => this.highlighted = true);
        this.display_object.addEventListener('rollout', () => this.highlighted = false);
        this.display_object.addEventListener('dblclick', () => {
            // d -> rot(d) -> ud(d) -> ud(rot(d)),
            let dwp = this._device_with_position;
            let device = dwp.device;
            let new_device;

            if (device instanceof RotatedDevice) {
                let inner_device = device._device;
                new_device = DeviceFactory.create_updown(inner_device);
            } else if (device instanceof UpDownDevice) {
                let inner_device = device._device;
                if (inner_device instanceof RotatedDevice) {
                    inner_device = inner_device._device;
                    new_device = inner_device;
                } else
                    new_device = DeviceFactory.create_updown(DeviceFactory.create_rotated(inner_device));
            } else
                new_device = DeviceFactory.create_rotated(device);

            this.device_with_position.device = new_device;
        });
    }

    get highlighted() {
        return this._hit_area.visible;
    }

    set highlighted(value) {
        this._hit_area.visible = value;

        /*let device = this._device_with_position.device;
        let info = this._layout_view.layout.get_info(device);
        if (info !== undefined)
            console.log('info', info);*/
    }

    get device_with_position() {
        return this._device_with_position;
    }
}