import {RuleSet} from "./RuleSet";
import {HexBoard} from "./HexBoard";

export const STEPS = 100;

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
            let [vts, fired_rule] = this._rule_set.value_to_set(board, cell);
            if (vts === 0)
                vts = board.value(cell);
            new_board.set_value(cell, vts);
        }

        return new_board;
    }

    get(index) {
        if (index < 0)
            index = 0;
        if (index > STEPS)
            index = STEPS;
        return this._boards[index];
    }

    period() { //returns null or {from, to}
        let hashes = new Array(STEPS + 1);
        let this_boards = this._boards;

        for (let i = 0; i <= STEPS; i++)
            hashes[i] = this_boards[i].hash_code();

        function eq(i, j) {
            if (hashes[i] !== hashes[j])
                return false;
            return this_boards[i].equals(this_boards[j]);
        }

        for (let i = 0; i <= STEPS; i++)
            for (let j = i + 1; j <= STEPS; j++)
                if (eq(i, j))
                    return {from: i, to: j - 1};

        return null;
    }
}