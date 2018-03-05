import {DeviceView} from "./DeviceView";
import {DeviceWithPosition} from "../model/DeviceWithPosition";
import {Terminal} from "../model/Terminal";
import {GAP, TERMINAL_DISTANCE} from "./LayoutView";

export class DeviceSelector {

    _device;
    _display_object;
    _device_view;
    _count_view;
    _layout_view;

    _count;

    constructor(device, layout_view, count) {
        this._device = device;
        this._layout_view = layout_view;
        this._init_display_object();
        this._count = count;
    }


    _init_display_object() {
        this._display_object = new createjs.Container();
        //top - device view
        //bottom - count
        this._update_device_view();
        this._count_view = new createjs.Text("", "1.4em Arial", "blue");

        this._display_object.addChild(this._device_view.display_object);
        this._display_object.addChild(this._count_view);

        this._count_view.y = this._device.height * TERMINAL_DISTANCE + 2 * GAP;
        this._count_view.textBaseline = "top";

        let view = new createjs.Shape();
        view.graphics.beginStroke("black").rect(0, 0, TERMINAL_DISTANCE, TERMINAL_DISTANCE);
        this._display_object.addChild(view);
    }

    _update_device_view() {
        let dwp = new DeviceWithPosition(this._device, new Terminal(0, 0));
        this._device_view = new DeviceView(this._layout_view, dwp);
    }

    get count() {
        return this._count;
    }

    set count(value) {
        this._count = value;
        this._count_view.text = '' + count;
    }

    get display_object() {
        return this._display_object;
    }
}