import {Point} from "./Point";
import {Constants} from "./constants"

export const POINT_TYPE_NORMAL = 0;
export const POINT_TYPE_DOUBLE = 1;
export const POINT_TYPE_TRIPLE = 2;
export const POINT_TYPE_FIXED = 3;

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

    draw(kioapi, g, over) {
        this.view(kioapi, g, over);
    }
}

export let point_types = [
    new PointType(new Point(1), "Обычная", bmp_drawer('block')),
    new PointType(new Point(2), "Двойная", just_color_point_drawer(color_from_type(2), color_from_type(3))),
    new PointType(new Point(3), "Тройная", just_color_point_drawer(color_from_type(3), color_from_type(4))),
    new PointType(new Point(0), "Закрепленная", bmp_drawer('base'))
];

function color_from_type(type) {
    let x = Math.floor(255 - 60 * type);
    let y = Math.floor(128 - 30 * type);
    return 'rgb(' + x + ',' + y + ',' + x + ')';
}

function just_color_point_drawer(color_normal, color_over) {
    return function (kioapi, g, over) {
        let color = over ? color_over : color_normal;
        g
            .beginStroke('black')
            .setStrokeStyle(1)
            .beginFill(color)
            .drawCircle(0, 0, Constants.POINT_RADIUS);
    };
}

function bmp_drawer(res_name) {
    return function (kioapi, g, over) {
        let res = over ? res_name + '_hover' : res_name;
        let resource = kioapi.getResource(res);

        let matrix = new createjs.Matrix2D(1, 0, 0, 1, -resource.width / 2, -resource.height / 2);
        g
            .beginBitmapFill(resource, 'no-repeat', matrix)
            .rect(-resource.width / 2, -resource.height / 2, resource.width, resource.height);
    }
}