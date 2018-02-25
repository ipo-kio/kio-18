import {RuleEditor} from "../view/RuleEditor";

export class RulesList {

    _html_element;
    _rule_editors = []; //array of rule editors
    _$rules_list;
    _$add_rule_button;

    constructor() {
        this.init_html_element();
        this.init_interaction();
    }

    init_html_element() {
        let $container = $('<div>');
        $container.addClass('rules-list-container');

        this._$rules_list = $('<div class="rules-list">');
        $container.append(this._$rules_list);

        let $add_rule_button = $('<button>');
        $add_rule_button.text('Добавить');

        this._$add_rule_button = $add_rule_button;
        $container.append(this._$add_rule_button);

        this._html_element = $container.get(0);
    }

    init_interaction() {
        this._$add_rule_button.click(e => {
            this.add_new_rule();
        });
    }

    add_new_rule() {
        let editor = new RuleEditor();
        this._$rules_list.append(editor.html_element);
        this._rule_editors.push(editor);

        this.update_rules_list();
    }

    remove_rule(index) {

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
}