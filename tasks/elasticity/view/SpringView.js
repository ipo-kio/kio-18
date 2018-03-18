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
        let b = 1;
        let b_prime = (a + b) * this._spring.actual_length / this._spring.length - a;
        if (b_prime < 0)
            b_prime = 0;
        g.clear().setStrokeStyle(2).setStrokeDash([a, b_prime]);

        let p1 = n2s(this._spring.first_point_with_position);
        let p2 = n2s(this._spring.second_point_with_position);

        if (this._spring.too_long)
            g.beginStroke('rgba(255, 0, 0, 0.25)');
        else
            g.beginStroke('#838383');

        g.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);

        if (!this._spring.too_long) {
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(d) >= 1e-4) {
                dx /= d;
                dy /= d;

                dx *= 2;
                dy *= 2;
                g
                    .beginStroke('#b8bcb8')
                    // .beginStroke('#979b97')
                    .moveTo(p1.x - dy, p1.y + dx)
                    .lineTo(p2.x - dy, p2.y + dx)
                    .beginStroke('#3c3c3c')
                    .moveTo(p1.x + dy, p1.y - dx)
                    .lineTo(p2.x + dy, p2.y - dx);
            }
        }

        let g_hit_area = this._hit_area.graphics;
        g_hit_area.clear().setStrokeStyle(10).beginStroke('rgba(102,198,238,0.6)').moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);

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

    get highlighted() {
        return this._highlighted;
    }

    set highlighted(value) {
        this._highlighted = value;
        this.redraw();
    }
}