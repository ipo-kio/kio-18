import {n2s} from "./GridView";

export class SpringView {

    _spring;
    _display_object;

    constructor(spring) {
        this._spring = spring;

        this.init_display_object();
        this.redraw_display_object();
        this._spring.ed.add_listener('change', e => this.redraw_display_object());
    }

    get display_object() {
        return this._display_object;
    }

    redraw_display_object() {
        let g = this._display_object.graphics;
        g.clear().setStrokeStyle(2).beginStroke('rgba(0, 200, 0, 0.8)');

        let p1 = n2s(this._spring.first_point_with_position);
        let p2 = n2s(this._spring.second_point_with_position);

        g.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
    }

    init_display_object() {
        this._display_object = new createjs.Shape();
    }
}