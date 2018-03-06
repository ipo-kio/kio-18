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
import {Slider} from "../hexagons/slider";
import {STEPS, LayoutHistory} from "./model/LayoutHistory";

export class Lamps {

    _initial_layout;
    _standard_initial_layout;
    _layout_view;
    _stage;

    _layout_history = null;

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

        this.init_time_controls(domNode);
    }

    static preloadManifest() {
        return [
            {id: "fly1", src: "lamps-resources/fly1.png"},
            {id: "fly1-hover", src: "lamps-resources/fly1_hover.png"},
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

        layout.add_device_with_position(new DeviceWithPosition(
            new UpDownDevice(new ControllerDevice()),
            new Terminal(5, 5)
        ));

        this._initial_layout = layout;

        this._standard_initial_layout = layout.copy();

        let lv = new LayoutView(layout, this.kioapi);

        //init canvas
        this._canvas = document.createElement('canvas');
        let layout_width = (layout.width - 1) * TERMINAL_DISTANCE + 2 * GAP;
        this._canvas.width = layout_width + GAP + 4 * (2 * TERMINAL_DISTANCE + GAP);
        this._canvas.height = (layout.height - 1) * TERMINAL_DISTANCE + 2 * GAP;

        this._stage = new createjs.Stage(this._canvas);
        this._canvas.className = 'kio-lamps-canvas';
        this._stage.enableMouseOver(10);
        this._stage.addChild(lv.display_object);

        let st = this._stage;
        function add_device_selector(device, x, y, count = 100) {
            let ds = new DeviceSelector(device, lv, count);

            ds.display_object.x = layout_width + x * TERMINAL_DISTANCE;
            ds.display_object.y = y * TERMINAL_DISTANCE;
            st.addChild(ds.display_object);
        }

        // create selectors
        add_device_selector(new WireDevice(2), 3, 1);
        add_device_selector(new WireDevice(3), 2, 0);
        add_device_selector(new RotatedDevice(new WireDevice(2)), 3, 2);
        add_device_selector(new RotatedDevice(new WireDevice(3)), 2, 1);

        add_device_selector(new ControllerDevice(0), 0, 0);
        add_device_selector(new UpDownDevice(new ControllerDevice(0)), 0, 2);
        add_device_selector(new RotatedDevice(new ControllerDevice(0)), 0, 4);
        add_device_selector(new RotatedDevice(new UpDownDevice(new ControllerDevice(0))), 0, 6);

        add_device_selector(new LampDevice([255, 0, 0]), 2, 4);
        add_device_selector(new RotatedDevice(new LampDevice([255, 0, 0])), 2, 5);

        add_device_selector(new LampDevice([255, 255, 0]), 3, 4);
        add_device_selector(new RotatedDevice(new LampDevice([255, 255, 0])), 2, 6);

        add_device_selector(new LampDevice([0, 255, 0]), 4, 4);
        add_device_selector(new RotatedDevice(new LampDevice([0, 255, 0])), 2, 7);

        this._layout_view = lv;
        this._layout_view.add_listener('change', this.__view_changed_listener);

        domNode.appendChild(this._canvas);
    }

    init_time_controls(domNode) {
        this._slider = new Slider(domNode, 0, STEPS, 35/*fly1 height*/, this.kioapi.getResource('fly1'), this.kioapi.getResource('fly1-hover'));
        this._slider.domNode.className = 'lamps-slider';
        domNode.appendChild(this._slider.domNode);

        function add_button(title, action) {
            let button = document.createElement('button');
            button.innerText = title;
            $(button).click(action);
            domNode.appendChild(button);
        }

        add_button('0', () => this._slider.value = 0);
        add_button('-1', () => this._slider.value--);
        add_button('+1', () => this._slider.value++);
        add_button('max', () => this._slider.value = STEPS);

        this._time_shower = document.createElement('span');
        this._time_shower.className = 'slider-time-shower';
        domNode.appendChild(this._time_shower);

        this._slider.onvaluechange = () => this.move_time_to(this.board_time());
    }

    move_time_to(time) {
        if (time < 0)
            time = 0;

        if (!this._layout_history && time > 0)
            this.new_history();

        this._layout_view.layout = time === 0 ? this._initial_layout : this._layout_history.get(time);
        this._time_shower.innerHTML = 'Шаг: <b>' + this.board_time() + '</b>';
    }

    board_time() {
        return Math.round(this._slider.value);
    }

    new_history() {
        this._layout_history = new LayoutHistory(this._initial_layout);
    }

    __view_changed_listener = () => {
        if (this.board_time() > 0) {
            this._initial_layout = this._layout_view.layout.copy_and_clear();
            this._layout_history = null;
            this._slider.value = 0;
        }
    }
}