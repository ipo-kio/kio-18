import {n2s, s2n} from "./GridView";

export class PointView {

    _display_object;
    _point_with_position;
    _movable = true;

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

        d.mouseEnabled = true;
        d.addEventListener("pressmove", e => {
            if (!this._movable)
                return;

            let np = s2n({x: this._display_object.x + e.localX, y: this._display_object.y + e.localY});
            this._point_with_position.set_location(np);
        });

        d.addEventListener("rollover", e => this.over = true);
        d.addEventListener("rollout", e => this.over = false);

        this._display_object = d;

        this.draw_point(NORMAL_COLOR);
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
        this.draw_point(_over ? OVER_COLOR : NORMAL_COLOR);
    }

    draw_point(color) {
        this._display_object.graphics
            .clear()
            .beginStroke('black')
            .setStrokeStyle(1)
            .beginFill(color)
            .drawCircle(0, 0, CIRCLE_RADIUS);
    }
}