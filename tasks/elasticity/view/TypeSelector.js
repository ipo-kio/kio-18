import {POINT_TYPE_NORMAL, point_types} from "../model/point_types";

export default class PointTypeSelector {

    _html_object;

    _current_point_type = POINT_TYPE_NORMAL;

    constructor() { //array of {type: Point, title: String}
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

        for (let i = 0; i < point_types.length; i++) {
            let {type, title} = point_types[i];
            let id = 'point-type-selector-' + i;

            let $element = $('<input type="radio" name="point_type">');
            $element.attr('id', id);
            $element.attr('value', '' + i);
            if (i === 0)
                $element.attr('checked', 'checked');
            $container.append($element);

            let $label = $('<label>');
            $label.attr('for', id);
            $label.html(title);
            $container.append($label);

            $element.change(e => {
                this._current_point_type = +$element.val();
            });
        }

        this._html_object = $container.get(0);
    }
}