import {ODE} from "../ode_solver_vec";

export default class TowerHistory {

    _ts;

    constructor(point_set, springs_set) { //set of points with positions
        let n = point_set.length;
        let variables_n = 4 * n;

        function x(i) { return 4 * i; }
        function y(i) { return 4 * i + 1; }
        function vx(i) { return 4 * i + 2; }
        function vy(i) { return 4 * i + 3; }

        let fun = function (t, ...cords) {
            let result = new Array(variables_n);
            for (let i = 0; i < n; i++) {
                result[x(i)] = cords[vx(i)];
                result[y(i)] = cords[vy(i)];
                result[vx(i)] = 0;
                result[vy(i)] = 0;
            }

            //Gravity
            for (let i = 0; i < n; i++) {
                let {point} = point_set.get(i);

                let w = point.weight;
                let [fx, fy] = gravity(w);
                result[vy(i)] += w === 0 ? 0 : fy / w;
            }

            //Guk
            for (let {
                first_point_with_position_index,
                second_point_with_position_index,
                first_point_with_position,
                second_point_with_position,
                length
            } of springs_set) {
                let [fx, fy] = guk(
                    cords[x(first_point_with_position_index)],
                    cords[y(first_point_with_position_index)],
                    cords[x(second_point_with_position_index)],
                    cords[y(second_point_with_position_index)],
                    length
                );

                let w1 = first_point_with_position.point.weight;
                let w2 = second_point_with_position.point.weight;

                result[vx(first_point_with_position_index)] += w1 === 0 ? 0 : fx / w1;
                result[vy(first_point_with_position_index)] += w1 === 0 ? 0 : fy / w1;

                result[vx(second_point_with_position_index)] -= w2 === 0 ? 0 : fx / w2;
                result[vy(second_point_with_position_index)] -= w2 === 0 ? 0 : fy / w2;
            }

            return result;
        };

        let ode = new ODE(fun, variables_n);

        ode.nh = 60 * 100; //1ms resolution

        //get initial values
        let y0 = new Array(variables_n);
        for (let i = 0; i < n; i++) {
            let point_with_position = point_set.get(i);
            y0[x(i)] = point_with_position.x;
            y0[y(i)] = point_with_position.y;
            y0[vx(i)] = 0;
            y0[vy(i)] = 0;
        }

        this._ts = ode.solve(0, 60, ...y0);
    }

    get ts() {
        return this._ts;
    }
}

const G = 9.81;
const K = 0.1;
const EPS = 1e-8;

function gravity(mass) {
    return [0, -G * mass];
}

function guk(x, y, x0, y0, len) {
    let dx = x - x0;
    let dy = y - y0;
    let d2 = dx * dx + dy * dy;

    if (d2 < EPS)
        return [0, 0];

    let d = Math.sqrt(d2);
    let f = -(d - len) * K;

    return [dx / d * f, dy / d * f];
}