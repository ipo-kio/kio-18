import {Spring} from "./Spring";
import ObjectsSet from "./ObjectsSet";
import {Constants} from "./constants";

let generation = 0; //for debug

export default function springs_evaluator(point_set) {

    generation++;

    let points_with_position = Array.from(point_set);

    let springs_set = new ObjectsSet();
    let spring_sizes = {};

    for (let first_point_i = 0; first_point_i < points_with_position.length; first_point_i++) {

        let fp = points_with_position[first_point_i];
        let best_points = new Array(Constants.MIN_POINTS); // {point, index, distance}

        for (let second_point_i = 0; second_point_i < points_with_position.length; second_point_i++)
            if (first_point_i !== second_point_i) {
                let sp = points_with_position[second_point_i];

                let d = fp.distance(sp);
                for (let i = 0; i < Constants.MIN_POINTS; i++) {
                    let best_point = best_points[i];
                    let current_distance = !best_point ? Number.MAX_VALUE : best_point.distance;

                    if (current_distance > d) {
                        //move all points up
                        for (let j = Constants.MIN_POINTS - 1; j >= i + 1; j--)
                            best_points[j] = best_points[j - 1];
                        best_points[i] = {point: sp, distance: d, index: second_point_i};
                        break;
                    }
                }
            }

        for (let best_point of best_points)
            if (best_point) {
                let {distance, index} = best_point;
                if (distance > Constants.MAX_DISTANCE)
                    break;

                let id = first_point_i < index ? first_point_i + '-' + index : index + '-' + first_point_i;
                if (!(id in spring_sizes)) {
                    let spring = new Spring(point_set, first_point_i, index, distance);
                    spring.generation = generation;
                    springs_set.add_object(spring);
                    spring_sizes[id] = 1;
                }
            }
    }

    return springs_set;
}