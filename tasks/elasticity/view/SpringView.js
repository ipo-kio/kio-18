import {n2s} from "./GridView";

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
        let b_prime = (a + b) * this._spring.actual_length / this._spring.length - a;
        if (b_prime < 0)
            b_prime = 0;
        g.clear().setStrokeStyle(2).beginStroke(this.line_color()).setStrokeDash([a, b_prime]);

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

    line_color() {
        if (this._spring.too_long)
            return "rgba(255,0,0,0.25)";
        else
            return "#000088";
    }


    get highlighted() {
        return this._highlighted;
    }

    set highlighted(value) {
        this._highlighted = value;
        this.redraw();
    }
}