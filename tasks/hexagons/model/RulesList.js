import {RuleEditor} from "../view/RuleEditor";
import {Rule} from "./HexBoard";
import {Event,EventDispatcherInterface} from "../EventDispatcherMixin";

export class RulesList extends EventDispatcherInterface {

    _html_element;
    _rule_editors = []; //array of rule editors
    _rules_list;
    _$add_rule_button;

    constructor() {
        super();
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
        $add_rule_button.text('Добавить');

        this._$add_rule_button = $add_rule_button;
        $container.append(this._$add_rule_button);

        this._html_element = $container.get(0);
    }

    init_interaction() {
        this._$add_rule_button.click(() => {
            this.add_new_rule();
        });
    }

    add_new_rule() {
        this.add_rules([new Rule()]);
    }

    add_rules(rules) {
        for (let rule of rules) {
            let editor = new RuleEditor(rule);
            this._rules_list.appendChild(editor.html_element);
            this._rule_editors.push(editor);

            this.add_listeners_to_editor(editor);

            this.update_rules_list();
        }
        this.fire_change();
    }

    clear_rules() {
        while (this._rule_editors.length > 0)
            this.remove_rule(this._rule_editors[0]);
    }

    get html_element() {
        return this._html_element;
    }

    update_rules_list() {
        let i = 0;
        for (let rule_editor of this._rule_editors) {
            rule_editor.show_up = i !== 0;
            rule_editor.show_down = i !== this._rule_editors.length - 1;
            i++;
        }
    }

    __up_listener = e => {
        let i = this._rule_editors.indexOf(e.source);
        if (i === 0)
            return;

        this._rule_editors.splice(i, 1);
        this._rule_editors.splice(i - 1, 0, e.source);

        this._rules_list.removeChild(e.source.html_element);
        this._rules_list.insertBefore(e.source.html_element, this._rules_list.children[i - 1]);

        this.update_rules_list();
    };
    __down_listener = e => {
        let i = this._rule_editors.indexOf(e.source);
        if (i === this._rule_editors.length - 1)
            return;

        this._rule_editors.splice(i, 1);
        this._rule_editors.splice(i + 1, 0, e.source);

        this._rules_list.removeChild(e.source.html_element);
        this._rules_list.children[i].insertAdjacentElement("afterEnd", e.source.html_element);

        this.update_rules_list();
    };
    __remove_listener = e => {
        this.remove_rule(e.source);
    };
    __change_listener = e => {
        this.fire_change();
    };

    fire_change() {
        this.fire(new Event('change', this));
    }

    remove_rule(editor) {
        this._rules_list.removeChild(editor.html_element);

        //remove editor from list of editors
        let i = this._rule_editors.indexOf(editor);
        this._rule_editors.splice(i, 1);

        this.remove_listeners_from_editor(editor);

        this.update_rules_list();

        this.fire_change();
    }

    add_listeners_to_editor(editor) {
        editor.add_listener("up", this.__up_listener);
        editor.add_listener("down", this.__down_listener);
        editor.add_listener("remove", this.__remove_listener);
        editor.add_listener("change", this.__change_listener);
    }

    remove_listeners_from_editor(editor) {
        editor.remove_listener("up", this.__up_listener);
        editor.remove_listener("down", this.__down_listener);
        editor.remove_listener("remove", this.__remove_listener);
        editor.remove_listener("change", this.__change_listener);
    }

    *raw_rules() {
        for (let rule_editor of this._rule_editors)
            yield rule_editor.rule;
    }
}