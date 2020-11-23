import {RuleEditor} from "../view/RuleEditor";
import {Rule, RULE_REGIME_EXACT_ANY_POSITION} from "./HexBoard";
import {Event,EventDispatcherInterface} from "../EventDispatcherMixin";
import {RuleSet} from "./RuleSet";

export class RulesList extends EventDispatcherInterface {

    _html_element;
    _rule_editors = []; //array of rule editors
    _rules_list;
    _rule_set = new RuleSet([]);
    _$add_rule_button;
    _$remove_rules_button;
    _fixed = false;

    constructor(problem) {
        super();
        this.problem = problem;
        this.init_html_element();
        this.init_interaction();
    }

    init_html_element() {
        let $container = $('<div>');
        $container.addClass('rules-list-container');

        this._rules_list = document.createElement('div');
        this._rules_list.className = "rules-list";
        $container.append(this._rules_list);

        let $add_rule_button = $('<button>');
        $add_rule_button.text(this.problem.message('Добавить'));
        this._$add_rule_button = $add_rule_button;
        $container.append(this._$add_rule_button);

        let $remove_rules_button = $('<button>');
        $remove_rules_button.text(this.problem.message('Очистить (двойной щелчок)'));
        this._$remove_rules_button = $remove_rules_button;
        $container.append(this._$remove_rules_button);

        this._html_element = $container.get(0);
    }

    init_interaction() {
        this._$add_rule_button.click(() => {
            this.add_new_rule();
        });
        this._$remove_rules_button.dblclick(() => {
            this.clear_rules();
        });
        this.add_listener('change', () => { //TODO this code smells... we add this listener in the constructor, so we hope it will be fired first
            this._rule_set = new RuleSet(Array.from(this.raw_rules()));
        });
    }

    add_new_rule() {
        if (this.fixed)
            return;
        this.add_rules([new Rule(false, RULE_REGIME_EXACT_ANY_POSITION)]);
    }

    add_rules(rules) {
        if (this.fixed)
            return;

        for (let rule of rules) {
            let editor = new RuleEditor(rule);
            this._rules_list.appendChild(editor.html_element);
            this._rule_editors.push(editor);

            this.add_listeners_to_editor(editor);
        }
        this.fire_change();
    }

    clear_rules() {
        if (this.fixed)
            return;
        while (this._rule_editors.length > 0)
            this.remove_rule(this._rule_editors[0]);
    }

    get html_element() {
        return this._html_element;
    }

    __remove_listener = e => {
        if (this.fixed)
            return;
        this.remove_rule(e.source);
    };
    __change_listener = e => {
        this.fire_change();
    };

    fire_change() {
        this.fire(new Event('change', this));
    }

    remove_rule(editor) {
        if (this.fixed)
            return;
        this._rules_list.removeChild(editor.html_element);

        //remove editor from list of editors
        let i = this._rule_editors.indexOf(editor);
        this._rule_editors.splice(i, 1);

        this.remove_listeners_from_editor(editor);

        this.fire_change();
    }

    add_listeners_to_editor(editor) {
        editor.add_listener("remove", this.__remove_listener);
        editor.add_listener("change", this.__change_listener);
    }

    remove_listeners_from_editor(editor) {
        editor.remove_listener("remove", this.__remove_listener);
        editor.remove_listener("change", this.__change_listener);
    }

    *raw_rules() {
        for (let rule_editor of this._rule_editors)
            yield rule_editor.rule;
    }

    get rule_set() {
        return this._rule_set;
    }

    rule_editors() {
        return this._rule_editors.values();
    }

    find_editor_by_rule(rule) {
        for (let editor of this._rule_editors)
            if (editor.rule === rule)
                return editor;

        return null;
    }

    get length() {
        return this._rule_editors.length;
    }

    get fixed() {
        return this._fixed;
    }

    set fixed(value) {
        this._fixed = value;
        if (value) {
            this._$add_rule_button.hide();
            this._$remove_rules_button.hide();
        } else {
            this._$add_rule_button.show();
            this._$remove_rules_button.show();
        }

        for (let re of this._rule_editors) {
            re.fixed = value;
        }
    }
}
