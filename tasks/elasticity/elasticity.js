import './elasticity.scss';
import GridView from "./view/GridView";
import PointSet from "./model/PointSet";
import {Point, PointWithPosition} from "./model/Point";
import springs_evaluator from "./model/springs_evaluator";

export class Elasticity {

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'elasticity';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);
        // this.kioapi.submitResult(this.current_path.result());

        createjs.Ticker.framerate = 20;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", this._stage);
    }

    static preloadManifest___________________1() {
        return [

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
        return '';
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
        this.initCanvas(domNode);

        this._grid_view.point_set = new PointSet();
        this._grid_view.point_set.add_point_with_position(new PointWithPosition(0, 0, new Point(1)));
        this._grid_view.point_set.add_point_with_position(new PointWithPosition(3, 2, new Point(1)));
        this._grid_view.point_set.add_point_with_position(new PointWithPosition(1, 0, new Point(1)));
        this._grid_view.point_set.add_point_with_position(new PointWithPosition(1, 1, new Point(1)));

        let springs_set = springs_evaluator(this._grid_view.point_set);
        this._grid_view.springs_set = springs_set;
    }

    initCanvas(domNode) {
        this._canvas = document.createElement('canvas');
        domNode.appendChild(this._canvas);
        this._canvas.className = "kio-elasticity-canvas";
        this._canvas.width = 400;
        this._canvas.height = 400;
        this._stage = new createjs.Stage(this._canvas);

        this._grid_view = new GridView(this._stage);
        this._stage.addChild(this._grid_view.display_object);
        this._stage.update();
    }
}