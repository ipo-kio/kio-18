import {Rule, RULE_REGIME_AT_LEAST_ANY_POSITION} from "../model/HexBoard";
import {RuleSet} from "../model/RuleSet";

let rule1 = new Rule([[1, 1], [1, 1, 1], [1, 1]]);
let rule2 = new Rule([[0, 0], [1, 1, 1], [1, 1]]);
let rule3 = new Rule([[1, 1], [1, 1, 1], [0, 0]]);
let rule4 = new Rule([[1, 1], [1, 1, 1], [1, 1]]);
rule4.regime = RULE_REGIME_AT_LEAST_ANY_POSITION;

console.log(RuleSet.implies(rule2, rule1));
console.log(RuleSet.implies(rule1, rule2));

let rs = new RuleSet([rule1, rule2, rule3, rule4]);
