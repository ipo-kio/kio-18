export class Graph {
    _data = new Map(); //Map<object,Set<object>>

    constructor() {
    }

    add_vertex(object) {
        if (!this._data.has(object))
            this._data.set(object, new Set());
    }

    add_edge(object1, object2) {
        let set1 = this._data.get(object1);
        if (set1 === undefined)
            return;
        set1.add(object2);
    }

    add_edges(predicate) { //predicate = function(vertex1, vertex2): boolean
        for (let v1 of this._data.keys())
            for (let v2 of this._data.keys())
                if (predicate(v1, v2))
                    this.add_edge(v1, v2);
    }

    has_edge(object1, object2) {
        let set1 = this._data.get(object1);
        if (set1 === undefined)
            return false;
        return set1.has(object2);
    }

    factorize() { //return
        let result = new Graph();
        let used = new Set();

        for (let v of this._data.keys()) {
            if (used.has(v))
                continue;

            let list = [];
            for (let v2 of this._data.keys())
                if (!used.has(v2) && this.has_edge(v, v2) && this.has_edge(v2, v)) {
                    list.push(v2);
                    used.add(v2);
                }

            result.add_vertex(list);
        }

        result.add_edges((l1, l2) => l1.length > 0 && l2.length > 0 && this.has_edge(l1[0], l2[0]));

        return result;
    }

    toString() {
        function setToString(s) {
            let result = '';
            for (let o of s)
                result += '(' + o + ')';
            return result;
        }

        let result = '';
        for (let [k, v] of this._data)
            result += k + ": " + setToString(v) + "\n";
        return result;
    }
}