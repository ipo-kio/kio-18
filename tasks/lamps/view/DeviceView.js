import {BatteryDevice} from "../model/devices/BatteryDevice";
import {ControllerDevice} from "../model/devices/ControllerDevice";
import {LampDevice} from "../model/devices/LampDevice";
import {ResistanceDevice} from "../model/devices/ResistanceDevice";
import {RotatedDevice} from "../model/devices/RotatedDevice";
import {UpDownDevice} from "../model/devices/UpDownDevice";
import {WireDevice} from "../model/devices/WireDevice1";
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./LayoutView";

export class DeviceView {

    _device_with_position;
    _display_object;
    _layout_view;

    constructor(layout_view, device_with_position) {
        this._device_with_position = device_with_position;
        this._device_with_position.add_listener('change', () => this._reposition());

        this._layout_view = layout_view;

        this._init_display_object();
        this._reposition();
    }

    _init_display_object() {
        let device = this._device_with_position.device;
        let info = this._layout_view.layout.get_info(device);
        this._display_object = this._create_display_object(device, info);
    }

    _reposition() {
        let {x, y} = this._device_with_position.terminal;
        this._display_object.x = GAP + x * TERMINAL_DISTANCE;
        this._display_object.y = GAP + y * TERMINAL_DISTANCE;
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
                console.log(big);
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
}