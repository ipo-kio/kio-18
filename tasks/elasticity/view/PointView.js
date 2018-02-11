import {n2s, s2n} from "./GridView";

const CIRCLE_RADIUS = 8;

export class PointView {

    _display_object;
    _point_with_position;

    constructor(point_with_position) {
        this._point_with_position = point_with_position;

        this.init_display_object();

        this.place_point();

        this._point_with_position.ed.add_listener('change', e => {
            this.place_point();
        });
    }

    init_display_object() {
        let d = new createjs.Shape();
        let g = d.graphics;
        g.beginStroke('black').setStrokeStyle(1).beginFill('rgb(255, 128, 128)').drawCircle(0, 0, CIRCLE_RADIUS);

        d.mouseEnabled = true;
        d.addEventListener("pressmove", e => {
            let np = s2n({x: this._display_object.x + e.localX, y: this._display_object.y + e.localY});
            this._point_with_position.set_location(np);
        });

        this._display_object = d;
    }

    place_point() {
        let screen_point = n2s(this._point_with_position);
        this._display_object.x = screen_point.x;
        this._display_object.y = screen_point.y;
    }

    get display_object() {
        return this._display_object;
    }
}