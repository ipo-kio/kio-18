import {Rule} from "../../hexagons/model/HexBoard";
import {HexBoardView} from "./HexBoardView";
import {Sizing} from "../model/sizing";
import {EventDispatcherMixin, Event} from "../EventDispatcherMixin";
import {
    RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION, RULE_REGIME_EXACT,
    RULE_REGIME_EXACT_ANY_POSITION
} from "../model/HexBoard";

const sizing = new Sizing(20);

class Nothing {} //TODO is there something else like this?

export class RuleEditor extends EventDispatcherMixin(Nothing) {
    _html_element;
    _rule;
    _rule_view;

    constructor() {
        super();

        this._rule = new Rule();
        this._rule_view = new HexBoardView(this._rule, sizing);
        this._rule_view.changeable = true;

        this.init_html_element();
    }

    init_html_element() {
        this._html_element = document.createElement('div');
        this._html_element.className = 'rule-editor-container';
        this._html_element.appendChild(this._rule_view.canvas);

        //add controls to the right
        let controls_container = document.createElement('div');
        controls_container.className = 'rule-controls-container';
        this._html_element.appendChild(controls_container);

        this._up_button = document.createElement('button');
        this._up_button.innerHTML = '&uarr;';

        let remove_button = document.createElement('button');
        remove_button.innerHTML = '-'; //'&#x274C;';

        this._down_button = document.createElement('button');
        this._down_button.innerHTML = '&darr;';

        let state = document.createElement('a');
        state.href = '#';
        state.innerText = regime_to_title(this._rule.regime);
        state.className = 'rule-regime';

        controls_container.appendChild(this._up_button);
        controls_container.appendChild(remove_button);
        controls_container.appendChild(this._down_button);
        controls_container.appendChild(state);

        // add listeners

        $(state).click(e => {
            this._rule.next_regime();
            state.innerText = regime_to_title(this._rule.regime);

            e.preventDefault();
        });

        $(remove_button).dblclick(e => {
            this.fire(new Event('remove', this));
        });

        $(this._down_button).click(e => {
            this.fire(new Event('down', this));
        });

        $(this._up_button).click(e => {
            this.fire(new Event('up', this));
        });
    }

    get html_element() {
        return this._html_element;
    }

    get rule() {
        return this._rule;
    }

    set rule(value) {
        this._rule = value;
    }

    set show_up(value) {
        this._up_button.style.visibility = value ? 'visible' : 'hidden';
    }

    set show_down(value) {
        this._down_button.style.visibility = value ? 'visible' : 'hidden';
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