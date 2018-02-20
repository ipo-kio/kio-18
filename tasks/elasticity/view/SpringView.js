import {n2s} from "./GridView";
import {HOT_COLD_PALETTE} from "./springs_view_palette";

export class SpringView {

    _spring;
    _display_object;

    _spring_shape;
    _hit_area;

    _highlighted = false;

    constructor(spring) {
        this._spring = spring;

        this.init_display_object();
        this.redraw();
        this._spring.ed.add_listener('change', e => this.redraw());
    }

    get display_object() {
        return this._display_object;
    }

    redraw() {
        let g = this._spring_shape.graphics;

        //a = 1, b = 2
        //(a + b') / (a + b) = this._spring.actual_length() / this._spring.length
        //b' = (a + b) * this._spring.actual_length() / this._spring.length - 1;
        let a = 4;
        let b = 2;
        let b_prime = (a + b) * this._spring.actual_length() / this._spring.length - a;
        if (b_prime < 0)
            b_prime = 0;
        g.clear().setStrokeStyle(2).beginStroke(this.elongation_color()).setStrokeDash([a, b_prime]);

        let p1 = n2s(this._spring.first_point_with_position);
        let p2 = n2s(this._spring.second_point_with_position);

        g.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);

        let g_hit_area = this._hit_area.graphics;
        g_hit_area.clear().setStrokeStyle(10).beginStroke('rgba(255,255,0,0.4)').moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);

        this._hit_area.visible = this._highlighted;
    }

    init_display_object() {
        this._display_object = new createjs.Container();
        this._spring_shape = new createjs.Shape();
        this._hit_area = new createjs.Shape();

        this._display_object.addChild(this._hit_area, this._spring_shape);

        this._spring_shape.hitArea = this._hit_area;
        this._spring_shape.mouseEnabled = true;
        this._spring_shape.addEventListener("rollover", () => this.highlighted = true);
        this._spring_shape.addEventListener("rollout", () => this.highlighted = false);
    }

    elongation_color() {
        return "black";

        let e = this._spring.relative_elongation;
        // convert -1 -- 1 to 0 .. 89
        let ind = Math.floor((-e + 0.1) / 0.2 * 90);
        if (ind > 89)
            ind = 89;
        if (ind < 0)
            ind = 0;
        return HOT_COLD_PALETTE[ind];
    }


    get highlighted() {
        return this._highlighted;
    }

    set highlighted(value) {
        this._highlighted = value;
        this.redraw();
    }
}