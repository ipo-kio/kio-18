import './hexagons.scss';
import {HexBoardView} from "./view/HexBoardView";
import {Sizing} from "./model/sizing";
import {HexagonCell, HexBoard, rectangular_shape, Rule} from "./model/HexBoard";
import {RulesList} from "./model/RulesList";
import {Slider} from "./slider";
import {BoardHistory, STEPS} from "./model/BoardHistory";

export class Hexagons {

    _points_animation_tick;
    _board_history = null;
    _initial_board;
    _standard_initial_board_values;

    _canvas;
    _grid_view;
    _rules_list = new RulesList();

    _slider;
    _time_shower;

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'hexagons';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);

        createjs.Ticker.framerate = 20;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

        this.move_time_to(0);
    }

    static preloadManifest() {
        return [
            {id: "fly1", src: "hexagons-resources/fly1.png"},
            {id: "fly1-hover", src: "hexagons-resources/fly1_hover.png"},
            {id: "fly2", src: "hexagons-resources/fly2.png"},
            {id: "ground", src: "hexagons-resources/ground.png"},
            {id: "roof", src: "hexagons-resources/roof.png"},
            {id: "bg", src: "hexagons-resources/bg.png"},
            {id: "target", src: "hexagons-resources/target.png"}
        ];
    }

    parameters() {
        /*
        Первый критерий: длина периода
        Второй критерий: количество компонент связности (чем меньше, тем лучше) (целостность организма)
        Третий критерий: количество цветных клеток (чем больше, тем лучше) (величина организма, точнее его сформированность)
         */
        function view(x) {
            if (x === 0)
                return '-';
            else
                return x;
        }

        return [
            {
                name: 'period',
                title: 'Период',
                ordering: 'maximize',
                view
            },
            {
                name: 'connect',
                title: 'Частей',
                ordering: "minimize",
                view
            },
            {
                name: 'size',
                title: 'Размер',
                ordering: 'maximize',
                view
            },
            {
                name: 'rules',
                title: 'Правил',
                ordering: 'minimize',
                view
            }
        ];
    }

    solution() {
        let r = [];
        for (let rule of this._rules_list.raw_rules())
            r.push([rule.values, rule.regime]);
        return {r, f: this._initial_board.values};
    }

    board_time() {
        return Math.round(this._slider.value);
    }

    loadSolution(solution) {
        if (!solution)
            return;

        this._rules_list.clear_rules();

        let rules = [];
        for (let values_regime of solution.r)
            if (values_regime.length === 2) //TODO remove later
                rules.push(new Rule(values_regime[0], values_regime[1]));
            else
                rules.push(new Rule(values_regime));
        this._rules_list.add_rules(rules);

        //load initial field
        this._initial_board.values = solution.f;

        this.reset_solution();
    }

    // private methods

    initInterface(domNode, preferred_width) {
        let canvas_container = document.createElement('div');
        canvas_container.className = 'main-board-container';

        this.init_canvas(canvas_container);
        domNode.appendChild(canvas_container);
        domNode.appendChild(this._rules_list.html_element);

        this.init_time_controls(domNode);

        this._rules_list.add_listener('change', () => {
            // this.reset_solution();
            this._board_history = null;
        });
    }

    reset_solution() {
        this._board_history = null;
        this._slider.value = 0;
    }

    init_time_controls(domNode) {
        this._slider = new Slider(domNode, 0, 100, 35/*fly1 height*/, this.kioapi.getResource('fly1'), this.kioapi.getResource('fly1-hover'));
        this._slider.domNode.className = 'hexagons-slider';
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
        this._time_shower.className = 'hexagons-time-shower';
        domNode.appendChild(this._time_shower);

        add_button('Очистить поле', () => {
            this._initial_board.values = this._standard_initial_board_values;
            this.reset_solution();
        });

        this._slider.onvaluechange = () => this.move_time_to(this.board_time());
    }

    new_history() {
        this._board_history = new BoardHistory(Array.from(this._rules_list.raw_rules()), this._initial_board);

        this._eval_parameters();
    }

    move_time_to(time) {
        if (time < 0)
            time = 0;

        if (!this._board_history && time > 0)
            this.new_history();

        this._grid_view.changeable = time === 0;

        this._grid_view.board = time === 0 ? this._initial_board : this._board_history.get(time);
        this._time_shower.innerHTML = 'Шаг: <b>' + this.board_time() + '</b>';
    }

    init_canvas(domNode) {
        let H = 17;
        let W = 21;

        let board = new HexBoard(rectangular_shape(H, W));

        let h = (H - 1) / 2;
        let {from, to} = board.line_borders(h);
        let w = (from + to) / 2;

        for (let cell of board.cells())
            board.set_value(cell, 1);
        board.set_value(new HexagonCell(h, w), 2);

        this._standard_initial_board_values = board.values;

        let sizing = new Sizing(16);
        this._grid_view = new HexBoardView(board, sizing);
        this._grid_view.changeable = true;
        this._grid_view.add_listener('change', () => this.reset_solution());
        this._grid_view.add_listener_to_all_cell_views('rollover', e => {
            let cell_view = e.source;
            let hc = cell_view.hex_cell;
            let rs = this._rules_list.rule_set;

            //highlight conforming rules
            let conforming_rules = rs.all_conforming_rules(this._grid_view.board, hc);
            for (let conforming_rule of conforming_rules) {
                let editor = this._rules_list.find_editor_by_rule(conforming_rule);
                if (editor !== null)
                    editor.extra_class = 'rule-conforms';
            }

            //highlight fired rule
            let [value_to_set, rule_fired] = rs.value_to_set(this._grid_view.board, hc);
            let fired_editor = this._rules_list.find_editor_by_rule(rule_fired);
            if (fired_editor !== null)
                fired_editor.extra_class = 'rule-fired';

        });
        this._grid_view.add_listener_to_all_cell_views('rollout', e => {
            //unhighlight everything
            for (let editor of this._rules_list.rule_editors())
                editor.extra_class = '';
        });

        domNode.appendChild(this._grid_view.canvas);
        this._initial_board = board;
    }

    _eval_parameters() {
        let period = this._board_history.period();
        if (period === null)
            this.kioapi.submitResult({
                period: 0,
                connect: 0,
                size: 0,
                rules: 0
            });

        let {from, to} = period;
        let max_parts = 0;
        let max_n = 0;
        for (let i = from; i <= to; i++) {
            let board = this._board_history.get(i);
            let {parts, n} = board.parts();
            if (parts > max_parts)
                max_parts = parts;
            if (n > max_n)
                max_n = n;
        }

        this.kioapi.submitResult({
            period: to - from + 1,
            connect: max_parts,
            size: max_n,
            rules: this._rules_list.length
        });
    }

}