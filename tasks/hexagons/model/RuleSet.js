import {
    Rule,
    RULE_REGIME_AT_LEAST_ANY_POSITION, RULE_REGIME_AT_MOST_ANY_POSITION, RULE_REGIME_EXACT,
    RULE_REGIME_EXACT_ANY_POSITION,
    RULE_SIZE
} from "./HexBoard";
import {Graph} from "./Graph";

class TreeElement {
    _rules; //a set of equivalent rules
    _children = [];

    constructor(rule) {
        this._rule = rule;
    }

    add_child(tree_element) {
        this._children.add_child(tree_element);
    }
}

export class RuleSet {

    _graph;

    constructor(array_of_rules) {
        let root_rule = new Rule([[0, 0], [0, 0, 0], [0, 0]]); //TODO generate
        array_of_rules.push(root_rule);

        let full_graph = new Graph();

        for (let rule of array_of_rules)
            full_graph.add_vertex(rule);

        full_graph.add_edges((r1, r2) => RuleSet.implies(r1, r2));

        console.info(full_graph.toString());
        this._graph = full_graph.factorize();
        console.info(this._graph.toString());
    }


    static equiv(rule1, rule2) {
        return this.implies(rule1, rule2) && this.implies(rule2, rule1);
    }

    static implies(rule1, rule2) {
        let tc1 = rule1.type_counts;
        let tc2 = rule2.type_counts;

        //1st case. not exact position imply exact positions only if not exact positions are all equal
        if (rule1.regime !== RULE_REGIME_EXACT && rule2.regime === RULE_REGIME_EXACT) {
            let i1 = tc1.indexOf(rule1.rule_size);
            let i2 = tc2.indexOf(rule2.rule_size);
            let all_full = i1 === i2 && i1 !== -1;
            if (!all_full)
                return false;
            return rule1.regime === RULE_REGIME_AT_LEAST_ANY_POSITION || rule1.regime === RULE_REGIME_EXACT_ANY_POSITION;
        }

        //2nd case, both are exact
        let vl1 = rule1.values_list;
        let vl2 = rule2.values_list;

        if (rule2.regime === RULE_REGIME_EXACT) {
            for (let i = 0; i < vl1.length; i++)
                if (vl2[i] !== 0 && vl1[i] !== vl2[i])
                    return false;
            return true;
        }

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