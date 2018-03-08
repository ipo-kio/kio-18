export class Constants {
    //physics
    static _G = 9.81;
    static _E = 400;
    static _FRICTION = 1;

    //points
    static _MAX_DISTANCE = 2.5;

    //view
    static _POINT_RADIUS = 8;

    static _TOTAL_SECONDS = 15;
    static _ODE_RESOLUTION = 1000;

    static _HAS_EARTH = false;

    static get G() {
        return this._G;
    }

    static get E() {
        return this._E;
    }

    static get FRICTION() {
        return this._FRICTION;
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

    static set MAX_DISTANCE(value) {
        this._MAX_DISTANCE = value;
    }

    static set POINT_RADIUS(value) {
        this._POINT_RADIUS = value;
    }

    static get TOTAL_SECONDS() {
        return this._TOTAL_SECONDS;
    }

    static set TOTAL_SECONDS(value) {
        this._TOTAL_SECONDS = value;
    }

    static get ODE_RESOLUTION() {
        return this._ODE_RESOLUTION;
    }

    static set ODE_RESOLUTION(value) {
        this._ODE_RESOLUTION = value;
    }

    static get HAS_EARTH() {
        return this._HAS_EARTH;
    }

    static set HAS_EARTH(value) {
        this._HAS_EARTH = value;
    }
}

if (window)
    window.Constants = Constants;