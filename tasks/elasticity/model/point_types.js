import {Point} from "./Point";

const NORMAL_COLOR = 'rgb(255, 128, 128)';
const OVER_COLOR = 'rgb(255, 200, 200)';

export const POINT_TYPE_NORMAL = 0;
export const POINT_TYPE_FIXED = 1;

export class PointType {
    _type;
    _title;
    _view;

    constructor(type, title, view) {
        this._type = type;
        this._title = title;
        this._view = view;
    }

    get type() {
        return this._type;
    }

    get title() {
        return this._title;
    }

    get view() {
        return this._view;
    }

    draw(g, over) {
        this.view(g, over);
    }
}

export let point_types = [ // todo create class PointType
    new PointType(new Point(1), "Обычная", just_color_point_drawer(NORMAL_COLOR, OVER_COLOR)),
    new PointType(new Point(0), "Закрепленная", just_color_point_drawer('red', 'rgb(255, 80, 80)'))
];

const CIRCLE_RADIUS = 8;

function just_color_point_drawer(color_normal, color_over) {
    return function (g, over) {
        let color = over ? color_over : color_normal;
        g
            .beginStroke('black')
            .setStrokeStyle(1)
            .beginFill(color)
            .drawCircle(0, 0, CIRCLE_RADIUS);
    };
}