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

    get_info(array_of_currencies) {
        return {currencies: array_of_currencies};
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get copy_and_clear() {
        return this;
    }
}