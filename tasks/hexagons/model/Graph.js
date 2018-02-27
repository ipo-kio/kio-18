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

    factorize(list_mapper) { //return
        let result = new Graph();
        let used = new Set();

        let vertex_to_list_of_initial_vertices = new Map();

        for (let v of this._data.keys()) {
            if (used.has(v))
                continue;

            let list = [];
            for (let v2 of this._data.keys())
                if (!used.has(v2) && this.has_edge(v, v2) && this.has_edge(v2, v)) {
                    list.push(v2);
                    used.add(v2);
                }

            let new_vertex = list_mapper(list);
            if (new_vertex !== null) {
                result.add_vertex(new_vertex);
                vertex_to_list_of_initial_vertices.set(new_vertex, list);
            }
        }

        result.add_edges((v1, v2) => {
            let l1 = vertex_to_list_of_initial_vertices.get(v1);
            let l2 = vertex_to_list_of_initial_vertices.get(v2);
            return l1 !== l2 && l1.length > 0 && l2.length > 0 && this.has_edge(l1[0], l2[0]);
        });

        return result;
    }

    *vertices() {
        for (let v of this._data.keys())
            yield v;
    }

    transitive_reduce() {
        let result = new Graph();

        for (let vertex of this._data.keys())
            result.add_vertex(vertex);

        for (let [vertex, edges] of this._data)
            for (let vertex_to of edges) {
                //search for a path
                let not_copy_edge = false;
                for (let v of this._data.keys())
                    if (v !== vertex && v !== vertex_to && this.has_edge(vertex, v) && this.has_edge(v, vertex_to))
                        not_copy_edge = true;
                if (!not_copy_edge)
                    result.add_edge(vertex, vertex_to);
            }

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

    dfs(vertex, fun) {
        let edges = this._data.get(vertex);
        let list = [];
        if (edges !== undefined)
            for (let v of edges)
                list.push(this.dfs(v, fun));

        return fun(vertex, list);
    }
}