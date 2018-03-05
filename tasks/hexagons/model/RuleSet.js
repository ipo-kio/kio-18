import {
    Rule,
    RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION, RULE_REGIME_EXACT,
    RULE_REGIME_EXACT_ANY_POSITION,
    RULE_SIZE
} from "./HexBoard";
import {Graph} from "./Graph";

export class RuleSet {

    _graph;
    _root_rule;
    _all_rules;

    constructor(array_of_rules) {
        this._all_rules = array_of_rules.slice();
        let full_graph = new Graph();

        for (let rule of array_of_rules)
            full_graph.add_vertex(rule);

        full_graph.add_edges((r1, r2) => RuleSet.implies(r2, r1));

        let factored_graph = full_graph.factorize(list => {
            if (list.length === 0)
                return null;
            let first_rule = list[0];
            let first_value_to_set = first_rule.value_to_set;
            for (let i = 1; i < list.length; i++)
                if (list[i].value_to_set !== first_value_to_set)
                    return null;
            return first_rule;
        });

        this._root_rule = new Rule([[0, 0], [0, 0, 0], [0, 0], [0]]);
        factored_graph.add_vertex(this._root_rule);
        for (let v of factored_graph.vertices())
            if (v !== this._root_rule)
                factored_graph.add_edge(this._root_rule, v);

        this._graph = factored_graph.transitive_reduce();
    }

    toString() {
        return this._graph.toString();
    }

    value_to_set(board, {line, index}) {
        return this._graph.dfs(this._root_rule, (rule, list) => {
            if (!rule.conforms(board, {line, index}))
                return [0, null];

            let result = 0;
            let this_fired_rule = null;
            for (let i = 0; i < list.length; i++) {
                let [deep_val, fired_rule] = list[i];
                if (deep_val !== 0) {
                    if (result === 0) {
                        result = deep_val;
                        this_fired_rule = fired_rule;
                    } else if (result !== 0 && deep_val !== result) {
                        result = 0;
                        this_fired_rule = null;
                        break;
                    }
                }
            }

            if (result !== 0)
                return [result, this_fired_rule];

            if (rule.value_to_set === 0)
                return [0, null];
            else
                return [rule.value_to_set, rule];
        });
    }

    all_conforming_rules(board, {line, index}) {
        let result = [];
        for (let rule of this._all_rules)
            if (rule.conforms(board, {line, index}))
                result.push(rule);
        return result;
    }


    static equiv(rule1, rule2) {
        return this.implies(rule1, rule2) && this.implies(rule2, rule1);
    }

    static implies(rule1, rule2) {
        let rule1_center_value = rule1.value(rule1.center_cell);
        let rule2_center_value = rule2.value(rule2.center_cell);
        if (rule2_center_value !== 0 && rule1_center_value !== rule2_center_value)
            return false;

        let tc1 = rule1.type_counts;
        let tc2 = rule2.type_counts;

        //1st case. not exact position imply exact positions only if not exact positions are all equal
        if (rule1.regime !== RULE_REGIME_EXACT && rule2.regime === RULE_REGIME_EXACT) {
            if (rule1.regime !== RULE_REGIME_AT_LEAST_ANY_POSITION && rule1.regime !== RULE_REGIME_EXACT_ANY_POSITION)
                return false;

            { //1st case, 006000 = 006000
                let i1 = tc1.indexOf(rule1.rule_size);
                let i2 = tc2.indexOf(rule2.rule_size);
                if (i1 === i2 && i1 !== -1)
                    return true;
            }
            { //2nd case, 005100 = 005100
                let i1 = tc1.indexOf(rule1.rule_size - 1);
                let i2 = tc2.indexOf(rule2.rule_size - 1);
                let j1 = tc1.indexOf(1);
                let j2 = tc2.indexOf(1);
                if (i1 === i2 && i1 !== -1 && j1 === j2 && j1 !== -1)
                    return true;
            }
            return false;
        }

        //2nd case, both are exact

        if (rule2.regime === RULE_REGIME_EXACT)
            return rule2.conforms(rule1, {line: 1, index: 1});

        let vl1 = rule1.values_list;
        let vl2 = rule2.values_list;

        //now, we know that second rule is not 'exact places'
        //let first rule be also not 'exact places'.
        let regime1 = rule1.regime;
        if (regime1 === RULE_REGIME_EXACT)
            regime1 = RULE_REGIME_EXACT_ANY_POSITION;
        let regime2 = rule2.regime;

        function allowed_values(t, regime, rule) {
            if (t === 0)
                return [0, rule.rule_size]; //6
            switch (regime) {
                case RULE_REGIME_EXACT_ANY_POSITION:
                    return [t, t];
                case RULE_REGIME_AT_LEAST_ANY_POSITION:
                    return [t, rule.rule_size];
                case RULE_REGIME_AT_MOST_ANY_POSITION:
                    return [0, t];
            }
        }

        for (let i = 0; i < tc1.length; i++) {
            let t1 = tc1[i];
            let t2 = tc2[i];
            let a1 = allowed_values(t1, regime1, rule1);
            let a2 = allowed_values(t2, regime2, rule2);
            if (!(a1[0] >= a2[0] && a1[1] <= a2[1]))
                return false;
        }

        return true;
    }

    /*static compare_rules(rule1, rule2) { //-1, 0, 1 if compared, 2 if can not be compared
        let tc1 = rule1.type_counts;
        let tc2 = rule2.type_counts;
        let has_more = false;
        let has_less = false;
        for (let i = 0; i < tc1.length; i++) {
            if (tc1[i] < tc2[i])
                has_less = true;
            else if (tc1[i] > tc2[i])
                has_more = true;
        }
        if (has_less && has_more)
            return 2;
        if (has_less)
            return -1;
        if (has_more)
            return 1;
        return 0;
    }*/

}