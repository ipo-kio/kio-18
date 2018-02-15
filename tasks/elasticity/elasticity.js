import './elasticity.scss';
import GridView from "./view/GridView";
import ObjectsSet from "./model/ObjectsSet";
import springs_evaluator from "./model/springs_evaluator";
import PointTypeSelector from "./view/TypeSelector";

import {WIDTH as GRID_WIDTH, HEIGHT as GRID_HEIGHT} from "./view/GridView";
import {POINT_TYPE_FIXED, POINT_TYPE_NORMAL} from "./model/point_types";
import TowerHistory from "./model/TowerHistory";
import {PointWithPosition} from "./model/PointWithPosition.js";

const POINTS_CHANGEABLE = 0;
const POINTS_FIXED = 1;

export class Elasticity {

    _$go_button;
    _points_animation_tick;
    _tower_history;

    constructor(settings) {
        this.settings = settings;
        this._points_animation_tick = this.points_animation_tick.bind(this);
    }

    id() {
        return 'elasticity';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);

        this._point_set.add_object(new PointWithPosition(0, 0, POINT_TYPE_FIXED));
        this._point_set.add_object(new PointWithPosition(-1, -1, POINT_TYPE_NORMAL));

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
        let p = []; //points

        for ({x, y, point_type_ind} of this._grid_view.point_set)
            p.push({x, y, t: point_type_ind});

        return {p};
    }


    loadSolution(solution) {
        if (!solution)
            return;

        this._point_set.clear();
        for ({x, y, t} of solution.p) //TODO add many objects by once
            this._point_set.add_object(new PointWithPosition(x, y, t));
    }

    // private methods

    _canvas;
    _stage;
    _grid_view;
    _point_set_manipulation_state = POINTS_CHANGEABLE;
    _point_set = new ObjectsSet();

    initInterface(domNode, preferred_width) {
        this.init_canvas(domNode);

        //grid_view
        this._grid_view.point_set = this._point_set;

        let point_set_changed_listener = () => {
            this._grid_view.springs_set = springs_evaluator(this._grid_view.point_set);
        };

        this._point_set.ed.add_listener('element change', point_set_changed_listener);
        this._point_set.ed.add_listener('change', point_set_changed_listener);
        point_set_changed_listener();

        //type selector
        let type_selector = new PointTypeSelector();
        domNode.appendChild(type_selector.html_object);
        this._grid_view.ed.add_listener('grid click', e => {
            if (this.point_set_manipulation_state === POINTS_CHANGEABLE)
                this._grid_view.point_set.add_object(new PointWithPosition(
                    e.natural_position.x,
                    e.natural_position.y,
                    type_selector.current_point_type
                ));
            }
        );

        //go button
        this._$go_button = $('<button type="button">');

        this.point_set_manipulation_state = POINTS_CHANGEABLE;

        $(domNode).append(this._$go_button);
        this._$go_button.click(() => {
            if (this.point_set_manipulation_state === POINTS_CHANGEABLE)
                this.point_set_manipulation_state = POINTS_FIXED;
            else
                this.point_set_manipulation_state = POINTS_CHANGEABLE;
        });
    }

    init_canvas(domNode) {
        this._canvas = document.createElement('canvas');
        domNode.appendChild(this._canvas);
        this._canvas.className = "kio-elasticity-canvas";
        this._canvas.width = GRID_WIDTH;
        this._canvas.height = GRID_HEIGHT;
        this._stage = new createjs.Stage(this._canvas);

        this._grid_view = new GridView();
        this._stage.addChild(this._grid_view.display_object);
        this._stage.enableMouseOver(10);
        this._stage.update();
    }

    get point_set_manipulation_state() {
        return this._point_set_manipulation_state;
    }

    set point_set_manipulation_state(value) {
        this._point_set_manipulation_state = value;

        if (value === POINTS_FIXED) {
            this._grid_view.allow_move = false;
            this._grid_view.point_set = Elasticity.copy_points_set(this._point_set);
            this._grid_view.springs_set = springs_evaluator(this._grid_view.point_set);
            this._$go_button.html("Расположить точки");

            this._tower_history = new TowerHistory(this._grid_view.point_set, this._grid_view.springs_set);

            this._animation_start_time = new Date().getTime();
            this._stage.addEventListener('tick', this._points_animation_tick);

            this._grid_view.grid_visible = false;
        } else if (value === POINTS_CHANGEABLE) {
            this._grid_view.allow_move = true;
            this._grid_view.point_set = this._point_set;
            this._grid_view.springs_set = springs_evaluator(this._grid_view.point_set);
            this._$go_button.html("Смотреть движение");
            this._stage.removeEventListener('tick', this._points_animation_tick);

            this._grid_view.grid_visible = true;
        }
    }

    static copy_points_set(point_set) {
        let result = new ObjectsSet();
        for (let {x, y, point_type_ind} of point_set)
            result.add_object(new PointWithPosition(x, y, point_type_ind));
        return result;
    }

    points_animation_tick() {
        let now = new Date().getTime();
        let passed = (now - this._animation_start_time) / 1000; // in seconds

        let history_point = this._tower_history.get_by_time(passed);

        let ps = this._grid_view.point_set;
        for (let i = 0; i < ps.length; i++)
            ps.get(i).set_location_without_normalization({x: history_point.vals[4 * i], y: history_point.vals[4 * i + 1]});
    }

}