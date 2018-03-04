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

        //first add equations about vertices
        //these are first N - 1 lines
        for (let i = 0; i < N - 1; i++) {
            let v = vertices[i];
            for (let [v2, edge_value] of connectors_graph.edges(v, true)) {
                let index = edge2index.get(edge_value);
                matrix[i][index] = 1;
            }
            for (let [v2, edge_value] of connectors_graph.edges(v, false)) {
                let index = edge2index.get(edge_value);
                matrix[i][index] = -1;
            }
        }

        //second add equations about loops
        let matrix_line = N - 1;
        for (let loop of connectors_graph.all_loops()) {
            let sum_emf = 0;
            for (let [edge, is_forward] of loop) {
                let index = edge2index.get(edge);

                let r = edge.resistance;

                let dir = is_forward ? 1 : -1;

                matrix[matrix_line][index] = dir * r;
                sum_emf += dir * edge.emf;
            }
            matrix[matrix_line][M] = sum_emf;
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