import {n2s, s2n} from "./GridView";

export class PointView {

    _display_object;
    _point_with_position;
    _movable = true;
    _allow_move;

    constructor(point_with_position, allow_move=true) {
        this._point_with_position = point_with_position;
        this._allow_move = allow_move;

        this.init_display_object();

        this.place_point();

        this._point_with_position.ed.add_listener('change', () => {
            this.place_point();
        });
    }

    init_display_object() {
        let d = new createjs.Shape();

        d.mouseEnabled = true;
        d.addEventListener("pressmove", e => {
            if (!this._allow_move)
                return;
            if (!this._movable)
                return;

            let np = s2n({x: this._display_object.x + e.localX, y: this._display_object.y + e.localY});
            this._point_with_position.set_location(np);
        });

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

    get movable() {
        return this._movable;
    }

    set movable(value) {
        this._movable = value;
    }

    set over(_over) {
        this.draw_point(_over);
    }

    draw_point(over) {
        let g = this._display_object.graphics;
        g.clear();
        this._point_with_position.point_type.draw(g, over);
    }
}