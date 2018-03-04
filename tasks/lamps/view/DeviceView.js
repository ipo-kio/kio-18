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

        this.init_display_object();
        this._reposition();
    }

    init_display_object() {
        let info = this._layout_view.layout.get_info(this._device_with_position.device);
        this._display_object = this._create_display_object(info);
    }

    _reposition() {
        let {x, y} = this._device_with_position;
        this._display_object.x = GAP + x * TERMINAL_DISTANCE;
        this._display_object.y = GAP + y * TERMINAL_DISTANCE;
    }

    _get_resource(id) {
        return this._layout_view.kioapi.getResource(id);
    }

    _create_display_object(device_info) {
        let {device} = this._device_with_position;

        let d;
        if (device instanceof BatteryDevice) {
            d = new createjs.Shape();
            let g = d.graphics;
            g.beginStroke('blue').strokeStyle(1);
            g.rect(2, -4, TERMINAL_DISTANCE - 4, 8);
            g.moveTo(0, 0).lineTo(2, 0);
            g.moveTo(TERMINAL_DISTANCE - 2, 0).lineTo(TERMINAL_DISTANCE, 0);
        } else if (device instanceof ControllerDevice) {
            d = new createjs.Bitmap(this._get_resource(device.is_on() ? 'c_on' : 'c_off'));
            d.regX = 4;
            d.regY = 4;
        } else if (device instanceof LampDevice) {
            let d = new createjs.Container();
            let img = new createjs.Bitmap(this._get_resource(device.is_on() ? 'lamp_on' : 'lamp_off'));
            img.regX = 4;
            img.regY = img.height / 2;
            d.addChild(img);

            let circle = new createjs.Shape();
            circle.x = img.width / 2;
            circle.y = img.height / 2;
            d.addChild(circle);

            d.beginRadialGradientFill([device.color(1), device.color(0)], [0, 1], 0, 0, 10, 0, 0, 100);
        } else if (device instanceof ResistanceDevice) {
            d = new createjs.Shape();
        } else if (device instanceof RotatedDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.scaleX *= -1;
            prerotated_d.scaleY *= -1;

            prerotated_d.x += device.width * TERMINAL_DISTANCE;
            prerotated_d.y += device.height * TERMINAL_DISTANCE;

            d = new createjs.Container;
            d.addChild(prerotated_d);
        } else if (device instanceof UpDownDevice) {
            let prerotated_device = device._device;
            let prerotated_d = this._create_display_object(prerotated_device, device_info);

            prerotated_d.scaleY *= -1;

            prerotated_d.y += device.height * TERMINAL_DISTANCE;

            d = new createjs.Container;
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
}