export class Sequence {

    _o2num;
    _elements = [];
    _elements_set = new Set();

    constructor(o2num) {
        this._o2num = o2num;
    }

    add_next(o) {
        let n = this._o2num(o);

        if (this._elements[this._elements.length - 1] === n)
            return;

        this._elements.push(n);
        this._elements_set.add(n);
    }

    /**
     * extra elements in another sequence
     * @param other
     */
    extra_elements_count(other) {
        let cnt = 0;
        for (let o of other._elements_set)
            if (!this._elements_set.has(o))
                cnt++;
        return cnt;
    }

    //https://gist.github.com/alexishacks/725df6db4432cd29cd43
    greatest_common_subsequence(other) {
        let s1 = this._elements;
        let s2 = other._elements;

        let result_i_1;

        let max = 0;

        for (let i = 0; i <= s1.length; i++) {
            let result_i = [];

            for (let j = 0; j <= s2.length; j++) {
                let currValue = 0;
                if (i === 0 || j === 0)
                    currValue = 0;
                else if (s1[i - 1] === s2[j - 1])
                    currValue = result_i_1[j - 1] + 1;
                else
                    currValue = 0; //Math.max(result_i[j - 1], result_i_1[j]);

                if (currValue > max)
                    max = currValue;

                result_i.push(currValue);
            }

            result_i_1 = result_i;
        }

        return max;//result_i[s2.length];
    }
}