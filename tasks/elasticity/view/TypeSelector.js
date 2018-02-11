import {PointView} from "./PointView";
import {PointWithPosition} from "../model/Point";

export default class PointTypeSelector {

    _html_object;
    _point_types;

    _current_point_type;

    constructor(point_types) { //array of {type: Point, title: String}
        this._point_types = point_types;

        this.init_html_object();
    }

    get current_point_type() {
        return this._current_point_type;
    }

    get html_object() {
        return this._html_object;
    }

    init_html_object() {

        let $container = $('<div>');

        for (let i = 0; i < this._point_types.length; i++) {
            let {type, title} = this._point_types[i];
            let id = 'point-type-selector-' + i;

            let $element = $('<input type="radio" name="point_type">');
            $element.attr('id', id);
            $element.attr('value', '' + i);
            $container.append($element);

            let $label = $('<label>');
            $label.attr('for', id);
            $label.html(title);
            $container.append($label);

            $element.change(e => {
                let i = $element.val();
                this._current_point_type = this._point_types[i].type;
            });
        }

        this._html_object = $container.get(0);
    }
}