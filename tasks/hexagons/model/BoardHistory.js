import {RuleSet} from "./RuleSet";

const STEPS = 100;

export class BoardHistory {

    _rule_set;

    constructor(rule_array, initial_board) { //array of rules
        this._rule_set = new RuleSet(rule_array);
    }

    apply_to_board(board) {
        for (let cell of board.cells()) {

        }
    }

    apply_to_cell(board, cell) {

    }

}