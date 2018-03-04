import './lamps.scss';
import {LayoutView} from "./view/LayoutView";
import {Layout} from "./model/Layout";
import {RotatedDevice} from "./model/devices/RotatedDevice";
import {BatteryDevice} from "./model/devices/BatteryDevice";
import {LampDevice} from "./model/devices/LampDevice";
import {WireDevice} from "./model/devices/WireDevice1";
import {Terminal} from "./model/Terminal";
import {DeviceWithPosition} from "./model/DeviceWithPosition";

export class Lamps {

    _layout_view;

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'lamps';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);

        createjs.Ticker.framerate = 20;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", this._layout_view._stage);
    }

    static preloadManifest() {
        return [
            {id: "c_on", src: "lamps-resources/c_on.png"},
            {id: "c_ff", src: "lamps-resources/c_off.png"},
            {id: "lamp_off", src: "lamps-resources/lamp_off.png"},
            {id: "lamp_on", src: "lamps-resources/lamp_on.png"}
        ];
    }

    parameters() {
        return [];
    }

    solution() {
        return {};
    }


    loadSolution(solution) {
        if (!solution)
            return;
    }

    initInterface(domNode, preferred_width) {
        let d1 = new BatteryDevice();
        let d2 = new LampDevice();
        let d3 = new RotatedDevice(new WireDevice(2));
        let d4 = new RotatedDevice(new WireDevice(2));

        let layout = new Layout(2, 2);
        layout.add_device_with_position(new DeviceWithPosition(d1, new Terminal(0, 1)));
        layout.add_device_with_position(new DeviceWithPosition(d2, new Terminal(0, 0)));
        layout.add_device_with_position(new DeviceWithPosition(d3, new Terminal(0, 0)));
        layout.add_device_with_position(new DeviceWithPosition(d4, new Terminal(1, 0)));

        this._layout_view = new LayoutView(layout, this.kioapi);

        domNode.appendChild(this._layout_view.canvas);
    }
}