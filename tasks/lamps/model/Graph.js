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

    *vertices() {
        for (let v of this._data.keys())
            yield v;
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
        let visited = new Set();
        let data = this._data;
        return inner_dfs(vertex, fun);

        function inner_dfs(vertex, fun) {
            visited.add(vertex);

            let edges = data.get(vertex);
            let list = [];
            if (edges !== undefined)
                for (let v of edges)
                    if (!visited.has(v)) {
                        let val = inner_dfs(v, fun);
                        if (val !== null)
                            list.push(val);
                    }

            return fun(vertex, list);
        }
    }

    kraskal() { //returns list of edges [v1, v2] and list of all other edges
        let vertices = Array.from(this.vertices());
        let n = vertices.length;
        let v2index = new Map();

        let i = 0;
        for (let v of vertices)
            v2index.set(v, i++);

        let colors = new Array(n);
        for (let i = 0; i < n; i++)
            colors[i] = i;

        let edges = [];
        let extra_edges = [];

        for (let v1 of vertices) {
            let i1 = v2index.get(v1);
            for (let v2 of this._data.get(v1)) {
                //edge v1 -> v2
                let i2 = v2index.get(v2);
                let c1 = colors[i1];
                let c2 = colors[i2];

                if (c1 === c2) {
                    extra_edges.push([v1, v2]);
                    continue;
                }

                for (let i = 0; i < n; i++)
                    if (colors[i] === c2)
                        colors[i] = c1;

                edges.push([v1, v2]);

                // if (edges.length === n - 1)
                //     return edges;
            }
        }

        let skeleton = new Graph();
        for (let v of this.vertices())
            skeleton.add_vertex(v);

        for (let [v1, v2] of edges) {
            skeleton.add_edge(v1, v2);
            skeleton.add_edge(v2, v1);
        }

        return {skeleton, extra_edges};
    }

    *all_loops() {
        let {skeleton, extra_edges} = this.kraskal();

        for (let [v1, v2] of extra_edges) {
            //find path from v1 to v2, in the skeleton
            let path = skeleton.dfs(v1, (vertex, list) => {
                if (vertex === v2)
                    return [v2];

                if (list.length === 0)
                    return null;

                let path = list[0];

                path.push(vertex);

                return path;
            });

            //path is a list from [v2, ............, v1]

            yield path;
        }
    }
}