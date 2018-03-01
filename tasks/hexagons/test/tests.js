import {
    HexagonCell,
    HexBoard, rectangular_shape,
    Rule, RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION,
    RULE_REGIME_EXACT_ANY_POSITION
} from "../model/HexBoard";
import {RuleSet} from "../model/RuleSet";
import {BoardHistory} from "../model/BoardHistory";

let rule1 = new Rule([[1, 2], [0, 3, 0], [0, 0]]);
let board = new HexBoard(rectangular_shape(10, 10));
board.set_value({line: 5, index: 5}, 1);     //. 1
board.set_value({line: 6, index: 5}, 2);     // 2 x
console.log(rule1.conforms(board, {line: 5, index: 4}) === true);
console.log(rule1.conforms(board, {line: 6, index: 6}) === true);

/*
let rule1 = new Rule([[1, 1], [1, 1, 1], [1, 1]]);
let rule2 = new Rule([[0, 0], [1, 1, 1], [1, 1]]);
let rule3 = new Rule([[1, 1], [1, 1, 1], [0, 0]]);
let rule31 = new Rule([[1, 1], [1, 1, 1], [2, 0]]);
let rule4 = new Rule([[1, 1], [1, 1, 1], [1, 1]]);
rule4.regime = RULE_REGIME_AT_LEAST_ANY_POSITION;

let rule5 = new Rule([[1, 1], [2, 1, 2], [0, 0]]);
rule5.regime = RULE_REGIME_AT_MOST_ANY_POSITION;
let rule6 = new Rule([[1, 1], [2, 1, 3], [2, 0]]);
rule6.regime = RULE_REGIME_EXACT_ANY_POSITION;

console.log(RuleSet.implies(rule2, rule4) === false);

console.log(RuleSet.implies(rule2, rule1) === false);
console.log(RuleSet.implies(rule1, rule2) === true);

console.log(RuleSet.implies(rule5, rule6) === false);
console.log(RuleSet.implies(rule6, rule5) === true);

let rs = new RuleSet([rule1, rule2, rule3, rule4, rule31]);

function create_board() {
    let H = 17;
    let W = 21;
    let board = new HexBoard(rectangular_shape(H, W));
    let h = (H - 1) / 2;
    let {from, to} = board.line_borders(h);
    let w = (from + to) / 2;
    board.set_value(new HexagonCell(h, w), 1);
    return board;
}

let board = create_board();

let bh = new BoardHistory([rule1, rule2, rule3, rule4, rule31], board);
console.info(bh);*/
