import './elasticity.scss';

export class Elasticity {

    constructor(settings) {
        this.settings = settings;
    }

    id() {
        return 'elasticity';
    }

    initialize(domNode, kioapi, preferred_width) {
        this.kioapi = kioapi;
        this.domNode = domNode;

        this.initInterface(domNode, preferred_width);
        // this.kioapi.submitResult(this.current_path.result());
    }

    static preloadManifest___________________1() {
        return [

        ];
    }

    parameters() {
        return [
            {
                name: 'height',
                title: 'Высота',
                ordering: 'maximize'
            }
        ];
    }

    solution() {
        return '';
    }

    loadSolution(solution) {
        if (!solution)
            return;
    }

    // private methods
    initInterface(domNode, preferred_width) {
        this.initCanvas(domNode);
    }

    initCanvas(domNode) {
        this.canvas = document.createElement('canvas');
        domNode.appendChild(this.canvas);
        this.canvas.className = "kio-elasticity-canvas";

        // this.points_view = new PointsView(this.canvas, this.kioapi, {
        //     canvas_width: 720,
        //     canvas_height: 300,
        //     x_left: -10,
        //     y_top: 20,
        //     pixel_size: PIXEL_SIZE
        // }, this.windows);
    }
}