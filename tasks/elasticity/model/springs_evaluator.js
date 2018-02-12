import {Spring} from "./Spring";
import ObjectsSet from "./ObjectsSet";

const MIN_POINTS = 3;
const MAX_DISTANCE = 5;

export default function springs_evaluator(point_set) {

    let points_with_position = Array.from(point_set);

    let springs_set = new ObjectsSet();
    let spring_sizes = {};

    for (let first_point_i = 0; first_point_i < points_with_position.length; first_point_i++) {

        let fp = points_with_position[first_point_i];
        let best_points = new Array(MIN_POINTS); // {point, index, distance}

        for (let second_point_i = 0; second_point_i < points_with_position.length; second_point_i++)
            if (first_point_i !== second_point_i) {
                let sp = points_with_position[second_point_i];

                let d = fp.distance2(sp);
                for (let i = 0; i < MIN_POINTS; i++) {
                    let best_point = best_points[i];
                    let current_distance = !best_point ? Number.MAX_VALUE : best_point.distance;

                    if (current_distance > d) {
                        //move all points up
                        for (let j = MIN_POINTS - 1; j >= i + 1; j--)
                            best_points[j] = best_points[j - 1];
                        best_points[i] = {point: sp, distance: d, index: second_point_i};
                        break;
                    }
                }
            }

        for (let best_point of best_points)
            if (best_point) {
                let {point, distance, index} = best_point;
                if (distance > MAX_DISTANCE)
                    break;

                let id = first_point_i < index ? first_point_i + '-' + index : index + '-' + first_point_i;
                if (!(id in spring_sizes)) {
                    let spring = new Spring(fp, point, distance);
                    springs_set.add_object(spring);
                    spring_sizes[id] = 1;
                }
            }
    }

    return springs_set;
}