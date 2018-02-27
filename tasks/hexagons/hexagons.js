import './hexagons.scss';
import {HexBoardView} from "./view/HexBoardView";
import {Sizing} from "./model/sizing";
import {HexagonCell, HexBoard, rectangular_shape, Rule} from "./model/HexBoard";
import {RulesList} from "./model/RulesList";
import {Slider} from "./slider";

export class Hexagons {

    _$go_button;
    _points_animation_tick;
    _tower_history;

    _canvas;
    _grid_view;
    _rules_list = new RulesList();

    _slider;

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
        return [
            {
                name: 'height',
                title: 'Высота',
                ordering: 'maximize'
            }
        ];
    }

    solution() {
        let r = [];
        for (let rule of this._rules_list.raw_rules())
            r.push(rule.values);
        return {r};
    }

    board_time() {
        return Math.round(this._slider.value);
    }

    loadSolution(solution) {
        if (!solution)
            return;

        this._rules_list.clear_rules();

        for (let values of solution.r) {
            let rule = new Rule(values);
            this._rules_list.add_rule(rule);
        }
    }

    // private methods

    initInterface(domNode, preferred_width) {
        let canvas_container = document.createElement('div');
        canvas_container.className = 'main-board-container';

        this.init_canvas(canvas_container);
        domNode.appendChild(canvas_container);
        domNode.appendChild(this._rules_list.html_element);

        this._slider = new Slider(domNode, 0, 100, 35/*fly1 height*/, this.kioapi.getResource('fly1'), this.kioapi.getResource('fly1-hover'));
        this._slider.domNode.className = 'hexagons-slider';
        domNode.appendChild(this._slider.domNode);

        this._slider.onvaluechange = () => this.move_time_to(this.board_time());
    }

    move_time_to(time) {
        let board = this._board_history.get(time);
    }

    init_canvas(domNode) {
        let H = 17;
        let W = 21;

        let board = new HexBoard(rectangular_shape(H, W));

        let h = (H - 1) / 2;
        let {from, to} = board.line_borders(h);
        let w = (from + to) / 2;

        board.set_value(new HexagonCell(h, w), 1);

        let sizing = new Sizing(16);
        this._grid_view = new HexBoardView(board, sizing);

        domNode.appendChild(this._grid_view.canvas);
    }
}