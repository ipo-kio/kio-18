import './lamps.scss';
import {GAP, LayoutView, TERMINAL_DISTANCE} from "./view/LayoutView";
import {Layout} from "./model/Layout";
import {Terminal} from "./model/Terminal";
import {DeviceWithPosition} from "./model/DeviceWithPosition";
import {DeviceSelector} from "./view/DeviceSelector";
import {Slider} from "../hexagons/slider";
import {STEPS, LayoutHistory, SEQ_1st_o2num, SEQ_2nd_o2num, SEQ_BOTH_o2num} from "./model/LayoutHistory";
import {DeviceFactory} from "./model/devices/device_factory";
import {Sequence} from "./model/devices/Sequence";

const INITIAL_SOLUTION = "{\"d\":[[\"rl0\",10,7],[\"b\",10,8],[\"_uc12\",10,9],[\"_rw2\",11,8],[\"_u_rw2\",10,8],[\"_rw3\",10,8],[\"_rw3\",14,8],[\"rl0\",11,8],[\"yl0\",12,8],[\"gl0\",13,8],[\"w4\",11,10],[\"_rw2\",10,7],[\"_rw2\",11,7]]}";

export class Lamps {

    _initial_layout;
    _standard_initial_layout;
    _layout_view;
    _stage;

    _layout_history = null;

    _1st_traffic_light_sequence = new Sequence(SEQ_1st_o2num);
    _2nd_traffic_light_sequence = new Sequence(SEQ_2nd_o2num);
    _both_traffic_light_sequence = new Sequence(SEQ_BOTH_o2num);

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'lamps' + this.settings.level;
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
            {id: "lamp_on", src: "lamps-resources/lamp_on.png"},
            {id: "lamp_off_2", src: "lamps-resources/lamp_off_2.png"},
            {id: "lamp_on_2", src: "lamps-resources/lamp_on_2.png"}
        ];
    }

    parameters() {
        /*function parse(str) {
            let colon = str.indexOf(':');
            if (colon < 0)
                return null;
            let i1 = +str.substring(0, colon);
            let i2 = +str.substring(colon + 1);
            return [i1, i2];
        }*/

        function view_wrongs([a, b]) {
            return (a + b) + ' = ' + a + 'л. + ' + b + 'нх.';
        }

        function normalize_wrongs([a, b]) {
            return a + b;
        }

        return [{
            name: 'wrongs',
            title: 'Неправильных сигналов',
            ordering: 'minimize',
            view: view_wrongs,
            normalize: normalize_wrongs
        }, {
            name: 'seq',
            title: 'Длина совпадения',
            ordering: 'maximize'
        }, {
            name: 'size',
            title: 'Элементов',
            ordering: 'minimize'
        },

        {
            name: 'wrongs1',
            title: 'Неправильных сигналов №1',
            ordering: 'minimize',
            view: view_wrongs,
            normalize: normalize_wrongs
        }, {
            name: 'seq1',
            title: 'Длина совпадения №1',
            ordering: 'maximize'
        },

        {
            name: 'wrongs2',
            title: 'Неправильных сигналов №2',
            ordering: 'minimize',
            view: view_wrongs,
            normalize: normalize_wrongs
        }, {
            name: 'seq2',
            title: 'Длина совпадения №2',
            ordering: 'maximize'
        }];
    }

    solution() {
        // console.log('solution', JSON.stringify(this._initial_layout.serializer));
        return this._initial_layout.serializer;
    }


    loadSolution(solution) {
        if (!solution)
            return;

        // uncomment to store initial_solution
        // console.log('loading', JSON.stringify(solution));
        this._initial_layout.serializer = solution;

        this.new_history();
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

        add_device_selector(DeviceFactory.create_red_lamp(0), 1.5, 6.5);
        add_device_selector(DeviceFactory.create_yellow_lamp(0), 2.5, 6.5);
        add_device_selector(DeviceFactory.create_green_lamp(0), 3.5, 6.5);

        add_device_selector(DeviceFactory.create_red_lamp(1), 1.5, 7.5);
        add_device_selector(DeviceFactory.create_yellow_lamp(1), 2.5, 7.5);
        add_device_selector(DeviceFactory.create_green_lamp(1), 3.5, 7.5);
        // add_device_selector(DeviceFactory.create_blue_lamp(), 4, 7);

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

        this._eval_parameters();
    }

    __view_changed_listener = () => {
        if (this.board_time() > 0) {
            this._initial_layout = this._layout_view.layout.copy_and_clear();
            this._layout_history = null;
            this._slider.value = 0;
        } else
            this._layout_history = null;
    };

    _eval_parameters() {
        let both_seq;
        let _1st_seq;
        let _2nd_seq;

        if (this._layout_history === null) {
            both_seq = new Sequence(); //the function is not needed because we will not add elements
            _1st_seq = new Sequence();
            _2nd_seq = new Sequence();
        } else {
            both_seq = this._layout_history.get_sequence(SEQ_BOTH_o2num);
            _1st_seq = this._layout_history.get_sequence(SEQ_1st_o2num);
            _2nd_seq = this._layout_history.get_sequence(SEQ_2nd_o2num);
        }

        this.kioapi.submitResult({
            wrongs: [
                this._both_traffic_light_sequence.extra_elements_count(both_seq),
                both_seq.extra_elements_count(this._both_traffic_light_sequence),
            ],
            seq: this._both_traffic_light_sequence.greatest_common_subsequence(both_seq),
            size: this._initial_layout.size,

            wrongs1: [
                this._1st_traffic_light_sequence.extra_elements_count(_1st_seq),
                _1st_seq.extra_elements_count(this._1st_traffic_light_sequence),
            ],
            seq1: this._1st_traffic_light_sequence.greatest_common_subsequence(_1st_seq),
            wrongs2: [
                this._2nd_traffic_light_sequence.extra_elements_count(_2nd_seq),
                _2nd_seq.extra_elements_count(this._2nd_traffic_light_sequence),
            ],
            seq2: this._2nd_traffic_light_sequence.greatest_common_subsequence(_2nd_seq)
        });
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
            this._both_traffic_light_sequence.add_next([1, 0, 0, 0, 0, 1]);
            this._both_traffic_light_sequence.add_next([1, 1, 0, 0, 1, 0]);
            this._both_traffic_light_sequence.add_next([0, 0, 1, 1, 0, 0]);
            this._both_traffic_light_sequence.add_next([0, 1, 0, 1, 1, 0]);
            seq_length += 4;
        }
    }
}