import {Graph} from "../../lamps/model/Graph";
import {BatteryDevice} from "../../lamps/model/devices/BatteryDevice";
import {CurrentMap} from "../../lamps/model/CurrentMap";
import {LampDevice} from "../../lamps/model/devices/LampDevice";
import {WireDevice} from "../../lamps/model/devices/WireDevice1";
import {Layout} from "../../lamps/model/Layout";
import {DeviceWithPosition} from "../../lamps/model/DeviceWithPosition";
import {Terminal} from "../../lamps/model/Terminal";
import {RotatedDevice} from "../../lamps/model/devices/RotatedDevice";

let d1 = new BatteryDevice();
let d2 = new LampDevice();
let d3 = new RotatedDevice(new WireDevice(2));
let d4 = new RotatedDevice(new WireDevice(2));

let layout = new Layout(
    2, 2,
    [
        new DeviceWithPosition(d1, new Terminal(0, 1)),
        new DeviceWithPosition(d2, new Terminal(0, 0)),
        new DeviceWithPosition(d3, new Terminal(0, 0)),
        new DeviceWithPosition(d4, new Terminal(1, 0))
    ]
);

console.log(layout.get_info(d1));
console.log(layout.get_info(d2));
console.log(layout.get_info(d3));
console.log(layout.get_info(d4));

function test_graph() {
    let matrix = [[1, 2, 3, 4], [4, 2, 4, 5], [1, 5, 5, -3]];

    console.log(CurrentMap._solve(matrix));

    let graph = new Graph();
    let v1 = "a";
    let v2 = "b";
    let v3 = "c";
    let v4 = "d";
    let v5 = "e";
    let v6 = "f";

    graph.add_vertex(v1);                  // a-b-c
    graph.add_vertex(v2);                  // | | |
    graph.add_vertex(v3);                  // d-e-f
    graph.add_vertex(v4);
    graph.add_vertex(v5);
    graph.add_vertex(v6);
    graph.add_vertex("u");
    graph.add_edge(v1, v2, "ab");
    graph.add_edge(v2, v3, "bc");
    graph.add_edge(v4, v5, "de");
    graph.add_edge(v5, v6, "ef");
    graph.add_edge(v1, v4, "ad");
    graph.add_edge(v2, v5, "be");
    graph.add_edge(v3, v6, "cf");
    graph.add_edge(v6, "u", "uuu");

    for (let loop of graph.all_loops())
        console.log(loop);
}

/*import {
    HexagonCell,
    HexBoard, rectangular_shape,
    Rule, RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION,
    RULE_REGIME_EXACT_ANY_POSITION
} from "../model/HexBoard";
import {RuleSet} from "../model/RuleSet";
import {BoardHistory} from "../model/BoardHistory";

let board = new HexBoard(rectangular_shape(10, 10));

let rule1 = new Rule([[1, 1], [0, 2, 0], [0, 0]]);
board.set_value({line: 5, index: 5}, 1);
console.log(rule1.conforms(board, {line: 5, index: 6}) === false);*/


/*let rule1 = new Rule([[1, 2], [0, 3, 0], [0, 0]]);
board.set_value({line: 5, index: 5}, 1);     //. 1
board.set_value({line: 6, index: 5}, 2);     // 2 x
console.log(rule1.conforms(board, {line: 5, index: 4}) === true);
console.log(rule1.conforms(board, {line: 6, index: 6}) === true);*/

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
