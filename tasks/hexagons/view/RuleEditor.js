import {Rule} from "../../hexagons/model/HexBoard";
import {HexBoardView} from "./HexBoardView";
import {Sizing} from "../model/sizing";

const sizing = new Sizing(20);

export class RuleEditor {
    _html_element;
    _rule;
    _rule_view;

    constructor() {
        this._rule = new Rule();
        this._rule_view = new HexBoardView(this._rule, sizing);
        this._rule_view.changeable = true;

        this.init_html_element();
    }

    init_html_element() {
        this._html_element = document.createElement('div');
        this._html_element.className = 'rule-editor-container';
        this._html_element.appendChild(this._rule_view.canvas);
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
}