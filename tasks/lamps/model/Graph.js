export class Graph {
    _data = new Map(); //Map<object,Map<object, value>>
    _back_data = new Map();

    constructor() {
    }

    add_vertex(object) {
        if (!this._data.has(object))
            this._data.set(object, new Map());
        if (!this._back_data.has(object))
            this._back_data.set(object, new Map());
    }

    add_edge(object1, object2, value) {
        let map1 = this._data.get(object1);
        if (map1 !== undefined)
            map1.set(object2, value);

        let map2 = this._back_data.get(object2);
        if (map2 !== undefined)
            map2.set(object1, value);
    }

    has_edge(object1, object2) {
        let map1 = this._data.get(object1);
        if (map1 === undefined)
            return undefined;
        return map1.has(object2);
    }

    get_edge(object1, object2) {
        let map1 = this._data.get(object1);
        if (map1 === undefined)
            return undefined;
        return map1.get(object2);
    }

    *vertices() {
        for (let v of this._data.keys())
            yield v;
    }

    *edges(vertex, back=false) {
        let data = back ? this._back_data : this._data;

        let e = data.get(vertex);
        if (e !== undefined)
            yield* e;
    }

    toString() {
        function mapToString(m) {
            let result = '';
            for (let o of m.keys())
                result += '(' + o + ')';
            return result;
        }

        let result = '';
        for (let [k, v] of this._data)
            result += k + ": " + mapToString(v) + "\n";
        return result;
    }

    dfs(vertex, fun) {
        let visited = new Set();
        let data = this._data;
        let back_data = this._back_data;
        return inner_dfs(vertex, fun);

        function inner_dfs(vertex, fun) {
            visited.add(vertex);

            let list = [];

            function iter_edges(data, is_forward) {
                let edges = data.get(vertex);
                if (edges !== undefined)
                    for (let [v, edge_value] of edges)
                        if (!visited.has(v)) {
                            let val = inner_dfs(v, fun);
                            if (val !== null)
                                list.push({value: val, edge: [edge_value, is_forward]});
                        }
            }

            iter_edges(data, true);
            iter_edges(back_data, false);

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
            for (let [v2, edge_value] of this._data.get(v1)) {
                //edge v1 -> v2
                let i2 = v2index.get(v2);
                let c1 = colors[i1];
                let c2 = colors[i2];

                if (c1 === c2) {
                    extra_edges.push([v1, v2, edge_value]);
                    continue;
                }

                for (let i = 0; i < n; i++)
                    if (colors[i] === c2)
                        colors[i] = c1;

                edges.push([v1, v2, edge_value]);
            }
        }

        let skeleton = new Graph();
        for (let v of this.vertices())
            skeleton.add_vertex(v);

        for (let [v1, v2, edge_value] of edges)
            skeleton.add_edge(v1, v2, edge_value);

        return {skeleton, extra_edges};
    }

    *all_loops() {
        let {skeleton, extra_edges} = this.kraskal();

        for (let [v1, v2, edge_value] of extra_edges) {
            //find path from v1 to v2, in the skeleton
            let path = skeleton.dfs(v1, (vertex, list) => {
                if (vertex === v2)
                    return [];

                if (list.length === 0)
                    return null;

                let {value:path, edge/*:[value, is_forward]*/} = list[0];

                path.push(edge);

                return path;
            });

            //path is a list of edges v1 -> ... -> v2
            path.push([edge_value, false]);

            yield path;
        }
    }
}