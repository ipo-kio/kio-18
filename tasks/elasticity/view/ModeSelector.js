import {EventDispatcher} from "../EventDispatcher";

export let MODE_CREATE_EDGE = 0;
export let MODE_CREATE_VERTEX = 1;
export let MODE_DO_NOTHING = 2;

export default class ModeSelector {

    _html_object;
    _ed = new EventDispatcher();

    _current_mode = MODE_CREATE_VERTEX;

    constructor() { //array of {type: Point, title: String}
        this.init_html_object();
    }

    get current_mode() {
        return this._current_mode;
    }

    set current_mode(value) {
        this._current_mode = value;
        this._ed.fire(new Event('change', this))
    }

    get html_object() {
        return this._html_object;
    }

    init_html_object() {

        let $container = $('<div class="elasticity-mode-selector">');

        let modes = [MODE_CREATE_VERTEX, MODE_CREATE_EDGE];
        let mode_titles = ['Двигать крепление', 'Устанавливать стержень'];
        $container.append($('<div class="title">При нажатии на крепление:</div>'));
        for (let i = 0; i < modes.length; i++) {
            let mode = modes[i];
            let title = mode_titles[i];
            let id = 'mode-selector-' + i;

            let $element = $('<input type="radio" name="mouse_action_mode">');
            $element.attr('id', id);
            $element.attr('value', '' + mode);
            if (mode === this.current_mode)
                $element.attr('checked', 'checked');
            $container.append($element);

            let $label = $('<label>');
            $label.attr('for', id);
            $label.html('&nbsp;');
            if (i === 0)
                $label.addClass('mode-move');
            else
                $label.addClass('mode-stick');
            $container.append($label);

            $element.change(e => {
                this.current_mode = +$element.val();
            });
        }

        this._html_object = $container.get(0);
    }

    get ed() {
        return this._ed;
    }
}