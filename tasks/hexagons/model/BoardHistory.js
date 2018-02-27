import {RuleSet} from "./RuleSet";
import {HexBoard} from "./HexBoard";

const STEPS = 100;

export class BoardHistory {

    _rule_set;
    _boards = new Array(STEPS + 1);

    constructor(rule_array, initial_board) { //array of rules
        this._rule_set = new RuleSet(rule_array);

        this._boards[0] = initial_board;
        for (let i = 1; i <= STEPS; i++)
            this._boards[i] = this.apply_to_board(this._boards[i - 1]);
    }

    apply_to_board(board) {
        let new_board = new HexBoard(board.shape);

        for (let cell of board.cells()) {
            let vts = this._rule_set.value_to_set(board, cell);
            if (vts === 0)
                vts = board.value(cell);
            new_board.set_value(cell, vts);
        }

        return new_board;
    }

    apply_to_cell(board, cell) {

    }

}