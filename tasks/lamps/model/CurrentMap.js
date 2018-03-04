export class CurrentMap {

    _connector_2_current = new Map();

    get_current(connector) {
        return this._connector_2_current.get(connector);
    }

    constructor(connectors_graph) {
        let vertices = Array.from(connectors_graph.vertices());

        let edge2index = new Map();
        let edges = [];
        for (let v1 of vertices)
            for (let [v2, edge_value] of connectors_graph.edges(v1)) {
                let index = edges.length;
                edges.push(edge_value);
                edge2index.set(edge_value, index);
            }

        let N = vertices.length;
        let M = edges.length;

        let matrix = new Array(M); //M times M + 1
        for (let i = 0; i < M; i++) {
            matrix[i] = new Array(M + 1);
            matrix[i].fill(0);
        }

        let {colors} = connectors_graph.kraskal();
        let colors_cnt = new Array(colors.length);
        colors_cnt.fill(0);
        for (let i = 0; i < colors.length; i++)
            colors_cnt[colors[i]]++;

        //first add equations about vertices
        //these are first N - k lines
        let j = 0;
        for (let i = 0; i < N; i++) {
            colors_cnt[colors[i]]--;
            if (colors_cnt[colors[i]] === 0)
                continue;

            let v = vertices[i];

            for (let [v2, edge_value] of connectors_graph.edges(v, true)) {
                let index = edge2index.get(edge_value);
                matrix[j][index] = 1;
            }
            for (let [v2, edge_value] of connectors_graph.edges(v, false)) {
                let index = edge2index.get(edge_value);
                matrix[j][index] = -1;
            }

            j++;
        }

        //second add equations about loops
        //these are next M - (N - k)
        for (let loop of connectors_graph.all_loops()) {
            let sum_emf = 0;
            for (let [edge, is_forward] of loop) {
                let index = edge2index.get(edge);

                let r = edge.resistance;

                let dir = is_forward ? 1 : -1;

                matrix[j][index] = dir * r;
                sum_emf += dir * edge.emf;
            }
            matrix[j][M] = sum_emf;

            j++;
        }

        let currents = CurrentMap._solve(matrix);

        for (let i = 0; i < M; i++)
            this._connector_2_current.set(edges[i], currents[i]);
    }

    static _solve(matrix) {
        let M = matrix.length;
        let indices = new Array(M);

        for (let line = 0; line < M; line++) {
            //find maximum element
            let max = 0;
            let max_index = -1;
            for (let i = 0; i < M; i++) {
                let abs = Math.abs(matrix[line][i]);
                if (abs > max) {
                    max = abs;
                    max_index = i;
                }
            }

            if (max_index === -1)
                return null;

            indices[line] = max_index;

            let a = matrix[line][max_index];

            for (let line2 = 0; line2 < M; line2++)
                if (line2 !== line) {
                    let mul = matrix[line2][max_index] / a;
                    for (let i = 0; i < M + 1; i++)
                        matrix[line2][i] -= mul * matrix[line][i];
                }

            for (let i = 0; i < M + 1; i++)
                matrix[line][i] /= a;
        }

        let x = new Array(M);
        for (let line = 0; line < M; line++)
            x[indices[line]] = matrix[line][M];

        return x;
    }
}