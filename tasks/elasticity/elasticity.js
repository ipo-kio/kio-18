import './elasticity.scss';
import GridView from "./view/GridView";
import ObjectsSet from "./model/ObjectsSet";
import PointTypeSelector from "./view/TypeSelector";

import {WIDTH as GRID_WIDTH, HEIGHT as GRID_HEIGHT} from "./view/GridView";
import {POINT_TYPE_FIXED, POINT_TYPE_NORMAL} from "./model/point_types";
import TowerHistory from "./model/TowerHistory";
import {PointWithPosition} from "./model/PointWithPosition.js";
import {Spring} from "./model/Spring";
import ModeSelector, {MODE_DO_NOTHING} from "./view/ModeSelector";

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

        let pwp1 = new PointWithPosition(0, 0, POINT_TYPE_FIXED);
        this._point_set.add_object(pwp1);
        let pwp2 = new PointWithPosition(-1, -1, POINT_TYPE_NORMAL);
        this._point_set.add_object(pwp2);
        this._springs_set.add_object(new Spring(pwp1, pwp2));

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
    _springs_set = new ObjectsSet();
    _type_selector;
    _mouse_mode_selector;

    initInterface(domNode, preferred_width) {
        this._mouse_mode_selector = new ModeSelector();
        this._mouse_mode_selector.ed.add_listener('change',
            () => this._grid_view.mouse_actions_mode = this._mouse_mode_selector.current_mode
        );
        this._type_selector = new PointTypeSelector();
        this._type_selector.ed.add_listener('change',
            () => this._grid_view.point_type_to_create = this._type_selector.current_point_type
        );

        this.init_canvas(domNode);

        domNode.appendChild(this._mouse_mode_selector.html_object);
        domNode.appendChild(this._type_selector.html_object);

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

        this._grid_view = new GridView(this._type_selector);
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
            this._grid_view.mouse_actions_mode = MODE_DO_NOTHING;
            this.copy_points_and_springs_set();
            this._$go_button.html("Расположить точки");

            this._tower_history = new TowerHistory(this._grid_view.point_set, this._grid_view.springs_set);

            this._animation_start_time = new Date().getTime();
            this._stage.addEventListener('tick', this._points_animation_tick);

            this._grid_view.grid_visible = false;
        } else if (value === POINTS_CHANGEABLE) {
            this._grid_view.mouse_actions_mode = this._mouse_mode_selector.current_mode;
            this._grid_view.point_set = this._point_set;
            this._grid_view.springs_set = this._springs_set;
            this._$go_button.html("Смотреть движение");
            this._stage.removeEventListener('tick', this._points_animation_tick);

            this._tower_history = null; //TODO either store it until any change, or don't store it at all

            this._grid_view.grid_visible = true;
        }
    }

    copy_points_and_springs_set() {
        let new_points_set = new ObjectsSet();
        for (let {x, y, point_type_ind} of this._point_set)
            new_points_set.add_object(new PointWithPosition(x, y, point_type_ind));

        let new_springs_set = new ObjectsSet();
        for (let {first_point_with_position, second_point_with_position} of this._springs_set) {
            let i1 = this._point_set.get_index(first_point_with_position);
            let i2 = this._point_set.get_index(second_point_with_position);
            new_springs_set.add_object(new Spring(
                new_points_set.get(i1), new_points_set.get(i2)
            ));
        }

        this._grid_view.point_set = new_points_set;
        this._grid_view.springs_set = new_springs_set;
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