import './lamps.scss';
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./view/LayoutView";
import {Layout} from "./model/Layout";
import {RotatedDevice} from "./model/devices/RotatedDevice";
import {BatteryDevice} from "./model/devices/BatteryDevice";
import {LampDevice} from "./model/devices/LampDevice";
import {WireDevice} from "./model/devices/WireDevice1";
import {Terminal} from "./model/Terminal";
import {DeviceWithPosition} from "./model/DeviceWithPosition";
import {UpDownDevice} from "./model/devices/UpDownDevice";
import {DeviceSelector} from "./view/DeviceSelector";
import {ControllerDevice} from "./model/devices/ControllerDevice";

export class Lamps {

    _layout_view;
    _stage;

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
        createjs.Ticker.addEventListener("tick", this._stage);
    }

    static preloadManifest() {
        return [
            {id: "c_on", src: "lamps-resources/c_on.png"},
            {id: "c_off", src: "lamps-resources/c_off.png"},
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
        let d2 = new UpDownDevice(new LampDevice([255, 255, 0]));
        let d3 = new RotatedDevice(new WireDevice(2));
        let d4 = new RotatedDevice(new WireDevice(2));
        let d5 = new RotatedDevice(new WireDevice(2));
        let d6 = new RotatedDevice(new WireDevice(2));
        let d7 = new LampDevice([255, 0, 255]);
        let d8 = new LampDevice([255, 0, 255]);
        let d9 = new WireDevice(2);

        let layout = new Layout(19, 13);

        layout.add_device_with_position(new DeviceWithPosition(d1, new Terminal(0, 1)));
        layout.add_device_with_position(new DeviceWithPosition(d2, new Terminal(0, 0)));
        layout.add_device_with_position(new DeviceWithPosition(d3, new Terminal(0, 0)));
        layout.add_device_with_position(new DeviceWithPosition(d4, new Terminal(1, 0)));

        layout.add_device_with_position(new DeviceWithPosition(d5, new Terminal(0, 1)));
        layout.add_device_with_position(new DeviceWithPosition(d6, new Terminal(2, 1)));
        layout.add_device_with_position(new DeviceWithPosition(d7, new Terminal(0, 2)));
        layout.add_device_with_position(new DeviceWithPosition(d8, new Terminal(1, 2)));
        layout.add_device_with_position(new DeviceWithPosition(d9, new Terminal(1, 1)));

        layout.add_device_with_position(new DeviceWithPosition(new ControllerDevice(), new Terminal(5, 5)));

        this._layout_view = new LayoutView(layout, this.kioapi);

        //init canvas
        this._canvas = document.createElement('canvas');
        let layout_width = (layout.width - 1) * TERMINAL_DISTANCE + 2 * GAP;
        this._canvas.width = layout_width + GAP + 4 * (2 * TERMINAL_DISTANCE + GAP);
        this._canvas.height = (layout.height - 1) * TERMINAL_DISTANCE + 2 * GAP;

        this._stage = new createjs.Stage(this._canvas);
        this._canvas.className = 'kio-lamps-canvas';
        this._stage.enableMouseOver(10);
        this._stage.addChild(this._layout_view.display_object);

        // create selectors
        let device_selectors = [
            new DeviceSelector(new WireDevice(1), this._layout_view, 100),
            new DeviceSelector(new WireDevice(2), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new WireDevice(1)), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new WireDevice(2)), this._layout_view, 100),

            new DeviceSelector(new ControllerDevice(0), this._layout_view, 100),
            new DeviceSelector(new UpDownDevice(new ControllerDevice(0)), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new ControllerDevice(0)), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new UpDownDevice(new ControllerDevice(0))), this._layout_view, 100),

            new DeviceSelector(new LampDevice([255, 0, 0]), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new LampDevice([255, 0, 0])), this._layout_view, 100),

            new DeviceSelector(new LampDevice([255, 255, 0]), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new LampDevice([255, 255, 0])), this._layout_view, 100),

            new DeviceSelector(new LampDevice([0, 255, 0]), this._layout_view, 100),
            new DeviceSelector(new RotatedDevice(new LampDevice([0, 255, 0])), this._layout_view, 100)
        ];

        let lines = [4, 4, 2, 2, 2];

        let i = 0;
        let line = 0;
        for (let ds of device_selectors) {
            if (i === lines[line]) {
                line++;
                i = 0;
            }
            ds.display_object.x = layout_width + GAP + i * (2 * TERMINAL_DISTANCE + GAP);
            ds.display_object.y = line * (GAP + 2 * TERMINAL_DISTANCE);

            this._stage.addChild(ds.display_object);

            i++;
        }

        domNode.appendChild(this._canvas);
    }
}