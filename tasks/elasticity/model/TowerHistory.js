import {ODE} from "../ode_solver_vec";
import {Constants} from "./constants";

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

            //TODO eval this just once: w === 0 ? 0 : fy / w;

            //Gravity //TODO by the way, we don't really need mass here, because acceleration does not depend on it
            for (let i = 0; i < n; i++) {
                let {point} = point_set.get(i);
                let w = point.weight;

                let [fx, fy] = gravity(w);
                result[vx(i)] += fx;
                result[vy(i)] += fy;
            }

            //Guk
            for (let {
                first_point_with_position,
                second_point_with_position,
                length
            } of springs_set) {
                let first_point_with_position_index = point_set.get_index(first_point_with_position);
                let second_point_with_position_index = point_set.get_index(second_point_with_position);

                let [fx, fy] = guk(
                    cords[x(first_point_with_position_index)],
                    cords[y(first_point_with_position_index)],
                    cords[x(second_point_with_position_index)],
                    cords[y(second_point_with_position_index)],
                    length
                );

                result[vx(first_point_with_position_index)] += fx;
                result[vy(first_point_with_position_index)] += fy;

                result[vx(second_point_with_position_index)] -= fx;
                result[vy(second_point_with_position_index)] -= fy;
            }

            //friction
            for (let i = 0; i < n; i++) {
                let [fx, fy] = friction(cords[vx(i)], cords[vy(i)]);
                result[vx(i)] += fx;
                result[vy(i)] += fy;
            }

            //now convert forces to accelerations
            for (let i = 0; i < n; i++) {
                let {point} = point_set.get(i);
                let w = point.weight;

                if (w === 0) {
                    result[vx(i)] = 0;
                    result[vy(i)] = 0;
                } else {
                    result[vx(i)] /= w;
                    result[vy(i)] /= w;
                }
            }

            //earth
            for (let i = 0; i < n; i++) {
                if (cords[y(i)] < -2) {
                    result[x(i)] = 0; //result[x(i)] / 10;
                    result[y(i)] = Math.max(0, result[y(i)]);
                    result[vx(i)] = 0; //result[vx(i)] / 10;
                    result[vy(i)] = Math.max(0, result[vy(i)]);
                }
            }

            return result;
        };

        let ode = new ODE(fun, variables_n);

        ode.nh = Constants.TOTAL_SECONDS * Constants.ODE_RESOLUTION; //1ms resolution

        //get initial values
        let y0 = new Array(variables_n);
        for (let i = 0; i < n; i++) {
            let point_with_position = point_set.get(i);
            y0[x(i)] = point_with_position.x;
            y0[y(i)] = point_with_position.y;
            y0[vx(i)] = 0;
            y0[vy(i)] = 0;
        }

        this._ts = ode.solve(0, Constants.TOTAL_SECONDS, ...y0);
    }

    get ts() {
        return this._ts;
    }

    get_by_time(passed) {
        if (passed < 0)
            passed = 0;
        if (passed > Constants.TOTAL_SECONDS)
            passed = Constants.TOTAL_SECONDS;

        let ind = this._ts.indexByX(passed);
        return this._ts.points[ind];
    }
}

const EPS = 1e-8;

function gravity(mass) {
    return [0, -Constants.G * mass];
}

function guk(x, y, x0, y0, len) {
    let dx = x - x0;
    let dy = y - y0;
    let d2 = dx * dx + dy * dy;

    if (d2 < EPS)
        return [0, 0];

    let d = Math.sqrt(d2);
    let f = -(d - len) * Constants.E / len;

    return [dx / d * f, dy / d * f];
}

function friction(vx, vy) {
    let d2 = vx * vx + vy * vy;
    if (d2 < EPS)
        return [0, 0];
    // let d = Math.sqrt(d2);
    //
    // return [-vx / d * FRICTION, -vy / d * FRICTION];
    return [-vx * Constants.FRICTION, -vy * Constants.FRICTION];
}