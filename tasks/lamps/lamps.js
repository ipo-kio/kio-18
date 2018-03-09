import './lamps.scss';
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./view/LayoutView";
import {Layout} from "./model/Layout";
import {Terminal} from "./model/Terminal";
import {DeviceWithPosition} from "./model/DeviceWithPosition";
import {DeviceSelector} from "./view/DeviceSelector";
import {Slider} from "../hexagons/slider";
import {STEPS, LayoutHistory} from "./model/LayoutHistory";
import {DeviceFactory} from "./model/devices/device_factory";
import {Sequence} from "./model/devices/Sequence";

const INITIAL_SOLUTION = "{\"d\":[[\"b\",9,9],[\"_rgl\",9,8],[\"_u_rw2\",10,8],[\"_u_ryl\",11,7],[\"_rw3\",9,7],[\"_uw2\",10,7],[\"_u_rw2\",11,8],[\"rl\",9,11],[\"yl\",10,11],[\"gl\",11,11],[\"bl\",12,11],[\"_rw3\",9,9],[\"w3\",11,9],[\"_u_rw3\",13,9],[\"c12\",9,7],[\"b\",10,9]]}";

export class Lamps {

    _initial_layout;
    _standard_initial_layout;
    _layout_view;
    _stage;

    _layout_history = null;

    _1st_traffic_light_sequence = new Sequence();
    _2nd_traffic_light_sequence = new Sequence();
    _both_traffic_lights_sequence = new Sequence();

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'lamps';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this._init_correct_sequences();

        this.initInterface(domNode, preferred_width);

        createjs.Ticker.framerate = 20;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", this._stage);

        this.init_time_controls(domNode);

        this.loadSolution(JSON.parse(INITIAL_SOLUTION));
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
        return this._initial_layout.serializer;
    }


    loadSolution(solution) {
        if (!solution)
            return;

        //uncomment to store initial_solution
        // console.log('loading', JSON.stringify(solution));
        this._initial_layout.serializer = solution;
    }

    initInterface(domNode, preferred_width) {
        let layout = new Layout(19, 13);

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

        this._layout_view = lv;
        this._layout_view.add_listener('change', this.__view_changed_listener);

        this._init_selectors(layout_width);

        domNode.appendChild(this._canvas);
    }

    _init_selectors(layout_width) {
        let st = this._stage;
        let lv = this._layout_view;
        function add_device_selector(device, x, y, count = 100) {
            let ds = new DeviceSelector(device, lv, count);

            ds.display_object.x = Math.round(layout_width + 6 + x * (TERMINAL_DISTANCE + 2));
            ds.display_object.y = Math.round(y * (TERMINAL_DISTANCE + 16));
            st.addChild(ds.display_object);
        }

        // create selectors

        for (let c_wait = 1; c_wait <= 6; c_wait++)
            for (let c_on = 1; c_wait + c_on <= 7; c_on++)
                add_device_selector(DeviceFactory.create_controller(c_wait, c_on), c_wait - 1, c_on - 1);

        add_device_selector(DeviceFactory.create_wire(4), 3, 5);
        add_device_selector(DeviceFactory.create_wire(3), 4, 4);
        add_device_selector(DeviceFactory.create_wire(2), 5, 3);

        add_device_selector(DeviceFactory.create_red_lamp(), 1, 7);
        add_device_selector(DeviceFactory.create_yellow_lamp(), 2, 7);
        add_device_selector(DeviceFactory.create_green_lamp(), 3, 7);
        add_device_selector(DeviceFactory.create_blue_lamp(), 4, 7);

        add_device_selector(DeviceFactory.create_battery(), 2.4, 8.2);
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
        } else
            this._layout_history = null;
    };

    __null_result = {period: 0, connect: 0, size: 0, rules: 0};

    _eval_parameters() {
        if (this._board_history === null) {
            this.kioapi.submitResult(this.__null_result);
            return;
        }


    }

    _init_correct_sequences() {
        let seq_length = 0;
        while (seq_length < STEPS + 1) {
            this._1st_traffic_light_sequence.add_next([1, 0, 0, 0, 0, 0]);
            this._1st_traffic_light_sequence.add_next([1, 1, 0, 0, 0, 0]);
            this._1st_traffic_light_sequence.add_next([0, 0, 1, 0, 0, 0]);
            this._1st_traffic_light_sequence.add_next([0, 1, 0, 0, 0, 0]);
            seq_length += 4;
        }

        seq_length = 0;
        while (seq_length < STEPS + 1) {
            this._2nd_traffic_light_sequence.add_next([0, 0, 0, 0, 0, 1]);
            this._2nd_traffic_light_sequence.add_next([0, 0, 0, 0, 1, 0]);
            this._2nd_traffic_light_sequence.add_next([0, 0, 0, 1, 0, 0]);
            this._2nd_traffic_light_sequence.add_next([0, 0, 0, 1, 1, 0]);
            seq_length += 4;
        }

        seq_length = 0;
        while (seq_length < STEPS + 1) {
            this._both_traffic_lights_sequence.add_next([1, 0, 0, 0, 0, 1]);
            this._both_traffic_lights_sequence.add_next([1, 1, 0, 0, 1, 0]);
            this._both_traffic_lights_sequence.add_next([0, 0, 1, 1, 0, 0]);
            this._both_traffic_lights_sequence.add_next([0, 1, 0, 1, 1, 0]);
            seq_length += 4;
        }
    }
}