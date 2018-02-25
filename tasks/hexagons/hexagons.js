import './hexagons.scss';
import {HexBoardView} from "./view/HexBoardView";
import {Sizing} from "./model/sizing";
import {HexBoard, rectangular_shape} from "./model/HexBoard";

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
        createjs.Ticker.addEventListener("tick", this._stage);
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
    _stage;
    _grid_view;

    initInterface(domNode, preferred_width) {
        this.init_canvas(domNode);
    }

    init_canvas(domNode) {
        this._canvas = document.createElement('canvas');
        domNode.appendChild(this._canvas);
        this._canvas.className = "kio-hexagons-canvas";
        this._canvas.width = 500;
        this._canvas.height = 500;
        this._stage = new createjs.Stage(this._canvas);

        let board = new HexBoard(rectangular_shape(5, 10));

        this._grid_view = new HexBoardView(board, new Sizing(10));

        this._stage.addChild(this._grid_view.display_object);
        this._stage.enableMouseOver(10);
        this._stage.update();
    }
}