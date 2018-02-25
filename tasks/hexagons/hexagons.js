import './hexagons.scss';
import {HexBoardView} from "./view/HexBoardView";
import {Sizing} from "./model/sizing";
import {HexBoard, rectangular_shape} from "./model/HexBoard";
import {RulesList} from "./model/RulesList";

export class Hexagons {

    _$go_button;
    _points_animation_tick;
    _tower_history;

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

    static preloadManifest___________________1() {
        return [];
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
        return {};
    }


    loadSolution(solution) {
        if (!solution)
            return;
    }

    // private methods

    _canvas;
    _grid_view;
    _rules_list = new RulesList();

    initInterface(domNode, preferred_width) {
        domNode.appendChild(this._rules_list.html_element);
        this.init_canvas(domNode);
    }

    init_canvas(domNode) {
        let board = new HexBoard(rectangular_shape(16, 20));

        let sizing = new Sizing(16);
        this._grid_view = new HexBoardView(board, sizing);

        domNode.appendChild(this._grid_view.canvas);
    }
}