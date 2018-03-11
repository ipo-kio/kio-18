import {HexBoardView} from "./HexBoardView";
import {Sizing} from "../model/sizing";
import {EventDispatcherMixin, Event, EventDispatcherInterface} from "../EventDispatcherMixin";
import {
    RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION, RULE_REGIME_EXACT,
    RULE_REGIME_EXACT_ANY_POSITION
} from "../model/HexBoard";

const sizing = new Sizing(20);

export class RuleEditor extends EventDispatcherInterface {
    _html_element;
    _rule_view;
    _extra_class = '';
    _fixed = false;
    _remove_button;

    constructor(rule) {
        super();

        this._rule_view = new HexBoardView(rule, sizing);
        this._rule_view.changeable = true;
        this._rule_view.add_listener('change', () => this.fire_change());

        this.init_html_element();
    }

    fire_change() {
        return this.fire(new Event('change', this));
    }

    init_html_element() {
        this._html_element = document.createElement('div');
        this.update_class_name();
        this._html_element.appendChild(this._rule_view.canvas);

        //add controls to the right
        let controls_container = document.createElement('div');
        controls_container.className = 'rule-controls-container';
        this._html_element.appendChild(controls_container);

        let remove_button = document.createElement('button');
        remove_button.innerHTML = '-'; //'&#x274C;';
        this._remove_button = remove_button;
        remove_button.className = "hex-rule-remove-button";

        let state = document.createElement('a');
        state.href = '#';
        state.innerText = regime_to_title(this.rule.regime);
        state.className = 'rule-regime';

        //TODO unhide state changer
        state.style.display = "none";

        // controls_container.appendChild(remove_button);
        this.html_element.appendChild(remove_button);
        controls_container.appendChild(state);

        // add listeners

        $(state).click(e => {
            if (this.fixed)
                return;
            this.rule.next_regime();
            state.innerText = regime_to_title(this.rule.regime);
            this.fire_change();

            e.preventDefault();
        });

        $(remove_button).dblclick(e => {
            this.fire(new Event('remove', this));
        });
    }

    get html_element() {
        return this._html_element;
    }

    get rule() {
        return this._rule_view.board;
    }

    get extra_class() {
        return this._extra_class;
    }

    set extra_class(value) {
        this._extra_class = value;
        this.update_class_name();
    }

    update_class_name() {
        this._html_element.className = ('rule-editor-container ' + this._extra_class).trim();
    }

    get fixed() {
        return this._fixed;
    }

    set fixed(value) {
        this._fixed = value;

        this._remove_button.style.display = value ? "none" : "inline-block";
        this._rule_view.changeable = !value;
    }
}

function regime_to_title(rule_regime) {
    switch (rule_regime) {
        case RULE_REGIME_EXACT:
            return 'точно';
        case RULE_REGIME_EXACT_ANY_POSITION:
            return 'ровно';
        case RULE_REGIME_AT_LEAST_ANY_POSITION:
            return 'больше';
        case RULE_REGIME_AT_MOST_ANY_POSITION:
            return 'меньше';
    }

    return '?';
}