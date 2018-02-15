import {n2s} from "./GridView";
import {HOT_COLD_PALETTE} from "./springs_view_palette";

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

        g.clear().setStrokeStyle(2).beginStroke(this.elongation_color());

        let p1 = n2s(this._spring.first_point_with_position);
        let p2 = n2s(this._spring.second_point_with_position);

        g.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
    }

    init_display_object() {
        this._display_object = new createjs.Shape();
    }

    elongation_color() {
        let e = this._spring.relative_elongation;
        // convert -1 -- 1 to 0 .. 89
        let ind = Math.floor((e + 0.1) / 0.2 * 90);
        if (ind > 89)
            ind = 89;
        if (ind < 0)
            ind = 0;
        return HOT_COLD_PALETTE[ind];
    }
}