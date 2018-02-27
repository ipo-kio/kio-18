import {
    Rule, RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION,
    RULE_REGIME_EXACT_ANY_POSITION
} from "../model/HexBoard";
import {RuleSet} from "../model/RuleSet";

let rule1 = new Rule([[1, 1], [1, 1, 1], [1, 1]]);
let rule2 = new Rule([[0, 0], [1, 1, 1], [1, 1]]);
let rule3 = new Rule([[1, 1], [1, 1, 1], [0, 0]]);
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

let rs = new RuleSet([rule1, rule2, rule3, rule4]);