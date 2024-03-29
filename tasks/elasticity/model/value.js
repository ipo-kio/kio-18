import {Constants} from "./constants";

export class Value {
    evaluate(history_point) {
    }

    get max_spread() {

    }

    get rounding_to() {

    }

    evaluate_and_round(history_point) {
        return this.round(this.evaluate(history_point));
    }

    round(x) {
        return Math.round(x / this.rounding_to) * this.rounding_to;
    }
}

export class HeightValue extends Value {

    evaluate(history_point) {
        let max_value = -Infinity;
        let min_value = +Infinity;
        for (let i = 0; i < history_point.vals.length; i += 4) {
            // let x = history_point.vals[i];
            let y = history_point.vals[i + 1];
            if (y > max_value)
                max_value = y;
            if (y < min_value)
                min_value = y;
        }

        if (min_value < 0)
            return; //return undefined

        return max_value;
    }

    get max_spread() {
        return 1;
    }

    get rounding_to() {
        return 0.1;
    }
}

export class Evaluator {
    _value;
    _tower_history;
    _ding_dong = false;
    _result;
    _error = false;

    constructor(value, tower_history) {
        this._value = value;
        this._tower_history = tower_history;

        //evaluate in 100 points for 2 last seconds
        let LAST_SECONDS = 2;
        let min_value = +Infinity;
        let max_value = -Infinity;
        for (let i = 0; i <= 100; i++) {
            let time = Constants.TOTAL_SECONDS - LAST_SECONDS + LAST_SECONDS * i / 100;
            let val = this._value.evaluate(this._tower_history.get_by_time(time));

            if (val === undefined) {
                this._error = true;
                return;
            }

            if (val < min_value)
                min_value = val;
            if (val > max_value)
                max_value = val;

            if (max_value - min_value > this._value.max_spread)
                this._ding_dong = true;
        }

        this._result = this._value.round((min_value + max_value) / 2);
    }


    get error() {
        return this._error;
    }

    get ding_dong() {
        return this._ding_dong;
    }

    get result() {
        return this._result;
    }
}