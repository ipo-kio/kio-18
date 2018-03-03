export class Device {

    _width;
    _height;

    constructor(width, height) {
        this._width = width;
        this._height = height;
    }

    get_next(array_of_currencies) {
        //abstract. Returns a new device on the next iteration
    }

    get_connections() {
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}