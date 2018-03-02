import './lamps.scss';

export class Lamps {

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'lamps';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);

        createjs.Ticker.framerate = 20;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", this._stage);
    }

    static preloadManifest___________________1() {
        return [];
    }

    parameters() {
        return [];
    }

    solution() {
        return {};
    }


    loadSolution(solution) {
        if (!solution)
            return;
    }

    initInterface(domNode, preferred_width) {

    }
}