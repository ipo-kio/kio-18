export class Constants {
    //physics
    static _G = 9.81;
    static _E = 400;
    static _FRICTION = 1;

    //points
    static _MIN_POINTS = 3;
    static _MAX_DISTANCE = 2.5;

    //view
    static _POINT_RADIUS = 8;

    static get G() {
        return this._G;
    }

    static get E() {
        return this._E;
    }

    static get FRICTION() {
        return this._FRICTION;
    }

    static get MIN_POINTS() {
        return this._MIN_POINTS;
    }

    static get MAX_DISTANCE() {
        return this._MAX_DISTANCE;
    }

    static get POINT_RADIUS() {
        return this._POINT_RADIUS;
    }

    static set G(value) {
        this._G = value;
    }

    static set E(value) {
        this._E = value;
    }

    static set FRICTION(value) {
        this._FRICTION = value;
    }

    static set MIN_POINTS(value) {
        this._MIN_POINTS = value;
    }

    static set MAX_DISTANCE(value) {
        this._MAX_DISTANCE = value;
    }

    static set POINT_RADIUS(value) {
        this._POINT_RADIUS = value;
    }
}

window.Constants = Constants;