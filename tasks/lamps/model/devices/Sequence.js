export class Sequence {

    _elements = [];

    add_next(o) {
        this._elements.push(o);
    }

    eval_result(comparator) {
        let count = 0;
        let time = 0;

        // https://leetcode.com/articles/longest-substring-without-repeating-characters/
        /*
        int n = s.length(), ans = 0;
        int[] index = new int[128]; // current index of character
        // try to extend the range [i, j]
        for (int j = 0, i = 0; j < n; j++) {
            i = Math.max(index[s.charAt(j)], i);
            ans = Math.max(ans, j - i + 1);
            index[s.charAt(j)] = j + 1;
        }
        return ans;
         */
        let n = this._elements.length;
        for (let from = 0; from < n; from++) {
            if (this._elements[from] < 0)
                continue;

            let set = new Set();
            let curr_count = 0;
            let last_added = null;
            for (let to = from; to < n; to++) {
                let e = this._elements[to];

                if (e === -1)
                    break;
                if (e === 0)
                    continue;

                if (set.has(e))
                    break;

                if (comparator(last_added, e)) {
                    curr_count++;
                    last_added = e;
                }
                let curr_time = to - from;

                set.add(e);

                if (curr_count > count) {
                    count = curr_count;
                    time = curr_time;
                } else if (curr_count === count && curr_time < time) {
                    time = curr_time;
                }
            }
        }

        return {count, time};
    }
}