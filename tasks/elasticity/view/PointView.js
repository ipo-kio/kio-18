import {n2s} from "./GridView";

export class PointView {

    _display_object;
    _point_with_position;

    constructor(kioapi, point_with_position) {
        this._kioapi = kioapi;
        this._point_with_position = point_with_position;

        this.init_display_object();

        this.place_point();

        this._point_with_position.ed.add_listener('change', () => {
            this.place_point();
        });
    }

    init_display_object() {
        let d = new createjs.Shape();

        d.mouseEnabled = true;

        d.addEventListener("rollover", () => this.over = true);
        d.addEventListener("rollout", () => this.over = false);

        this._display_object = d;

        this.draw_point(false);
    }

    place_point() {
        let screen_point = n2s(this._point_with_position);
        this._display_object.x = screen_point.x;
        this._display_object.y = screen_point.y;
    }

    get display_object() {
        return this._display_object;
    }

    set over(_over) {
        this.draw_point(_over);
    }

    get point_with_position() {
        return this._point_with_position;
    }

    draw_point(over) {
        let g = this._display_object.graphics;
        g.clear();
        this._point_with_position.point_type.draw(this._kioapi, g, over);
    }
}