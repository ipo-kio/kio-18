import './hexagons.scss';
import {HexBoardView} from "./view/HexBoardView";
import {Sizing} from "./model/sizing";
import {
    HexagonCell, HexBoard, rectangular_shape, Rule, RULE_REGIME_EXACT_ANY_POSITION,
    TYPES_COUNT, set_types_count
} from "./model/HexBoard";
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
    _rules_list;

    _slider;
    _time_shower;

    _set_interval_id = null;

    constructor(settings) {
        this.settings = settings;
        set_types_count(2 + settings.level);
    }

    id() {
        return 'hexagons' + this.settings.level;
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
                name: 'ini_size',
                title: 'Начальный размер',
                ordering: 'maximize',
                normalize(v) {
                    if (v > 20 || v < 0)
                        return -1;
                    else
                        return 0;
                },
                view(v) {
                    if (v > 20)
                        return v + ' (много)';
                    else
                        return v + ' (норма)';
                }
            },
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
        for (let [values, regime] of solution.r)
            rules.push(new Rule(values, regime));
        this._rules_list.add_rules(rules);

        //load initial field
        this._initial_board.values = solution.f;

        this._slider.value = 0;
        this.new_history();
        this._eval_parameters();
    }

    // private methods

    initInterface(domNode, preferred_width) {
        this._rules_list = new RulesList();
        this.init_rules_list();
        this._rules_list.fixed = this.settings.level <= 1;

        let canvas_container = document.createElement('div');
        canvas_container.className = 'main-board-container';

        this.init_canvas(canvas_container);
        domNode.appendChild(canvas_container);
        domNode.appendChild(this._rules_list.html_element);

        //init a 'clear field' button
        let field_clear_button = document.createElement('button');
        field_clear_button.className = 'hex-field-clear-button';
        field_clear_button.innerHTML = "Очистить поле (двойной щелчок)";
        $(field_clear_button).dblclick(() => {
            this._initial_board.values = this._standard_initial_board_values;
            this.reset_solution();
        });
        domNode.appendChild(field_clear_button);

        this.init_time_controls(domNode, preferred_width);

        this._rules_list.add_listener('change', () => {
            // this.reset_solution();
            this._board_history = null;
            this._eval_parameters();
        });
    }

    reset_solution() {
        this._board_history = null;
        this._slider.value = 0;
        this._stop_play();
        this._eval_parameters();
    }

    init_time_controls(domNode, preferred_width) {
        let time_controls_container = document.createElement('div');
        time_controls_container.className = 'time-controls-container';
        domNode.appendChild(time_controls_container);

        this._slider = new Slider(time_controls_container, 0, 100, 35/*fly1 height*/, this.kioapi.getResource('fly1'), this.kioapi.getResource('fly1-hover'));
        this._slider.domNode.className = 'hexagons-slider';
        this._slider.resize(preferred_width - 16);
        time_controls_container.appendChild(this._slider.domNode);

        function add_button(title, id, action) {
            let button = document.createElement('button');
            button.id = id;
            button.innerHTML = title;
            $(button).click(action);
            time_controls_container.appendChild(button);
        }

        this._start_play = () => {
            this._set_interval_id = setInterval(() => {
                if (this._slider.value >= this._slider.max_value)
                    this._stop_play();
                else
                    this._slider.value++;
            }, 600);
            $('#slider-control-play').text('Остановить');
        };

        this._stop_play = () => {
            clearInterval(this._set_interval_id);
            this._set_interval_id = null;
            $('#slider-control-play').text('Запустить');
        };

        add_button('В начало', 'slider-control-0', () => this._slider.value = 0);
        add_button('-1', 'slider-control-p1', () => this._slider.value--);
        add_button('+1', 'slider-control-m1', () => this._slider.value++);
        add_button('В конец', 'slider-control-max', () => this._slider.value = STEPS);
        add_button('Запустить', 'slider-control-play', () => {
            if (this._set_interval_id === null)
                this._start_play();
            else
                this._stop_play();
        });

        this._time_shower = document.createElement('span');
        this._time_shower.className = 'hexagons-time-shower';
        time_controls_container.appendChild(this._time_shower);

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
        board.set_value(new HexagonCell(h, w - 1), 2);
        if (this.settings.level > 0)
            board.set_value(new HexagonCell(h, w), 3);
        else
            board.set_value(new HexagonCell(h, w), 2);
        board.set_value(new HexagonCell(h, w + 1), 2);

        this._standard_initial_board_values = board.values;

        let sizing = new Sizing(16);
        this._grid_view = new HexBoardView(board, sizing, 6);
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

    __null_result = {period: 0, connect: 0, size: 0, rules: 0};

    _eval_parameters() {
        let {n:ini_size} = this._initial_board.parts();

        if (this._board_history === null) {
            this.kioapi.submitResult({...this.__null_result, ini_size});
            return;
        }

        let period = this._board_history.period();
        if (period === null) {
            this.kioapi.submitResult({...this.__null_result, ini_size});
            return;
        }

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
            ini_size,
            period: to - from + 1,
            connect: max_parts,
            size: max_n,
            rules: this._rules_list.length
        });
    }

    init_rules_list() {
        let rules_list = [];
        switch (this.settings.level) {
            case 0:
                rules_list = [
                    new Rule([[1, 2], [1, 1, 2, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[1, 1], [1, 2, 1, 1], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 1], [1, 2, 1, 1], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[1, 2], [1, 2, 2, 1], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 2], [2, 2, 2, 1], [1, 2]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 2], [2, 2, 2, 1], [2, 2]], RULE_REGIME_EXACT_ANY_POSITION)
                ];
                break;
            case 1:
            case 2:
                rules_list = [
                    new Rule([[1, 1], [2, 1, 1, 2], [2, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[3, 1], [2, 1, 1, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),

                    new Rule([[2, 2], [2, 2, 1, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 3], [2, 2, 1, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[3, 3], [2, 2, 1, 3], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[3, 3], [3, 2, 1, 3], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),

                    new Rule([[2, 2], [2, 2, 2, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 2], [2, 2, 3, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[2, 3], [2, 2, 3, 2], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[3, 3], [2, 2, 3, 3], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[3, 3], [3, 2, 3, 3], [1, 1]], RULE_REGIME_EXACT_ANY_POSITION),

                    new Rule([[0, 0], [0, 2, 0, 1], [0, 0]], RULE_REGIME_EXACT_ANY_POSITION),
                    new Rule([[0, 0], [0, 3, 0, 3], [0, 0]], RULE_REGIME_EXACT_ANY_POSITION)
                ];
                break;
        }

        this._rules_list.add_rules(rules_list)
    }
}