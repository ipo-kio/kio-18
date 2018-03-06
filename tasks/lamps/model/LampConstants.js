export class LampConstants {

    static _BATTERY_RESISTANCE = 34;
    static _BATTERY_EMF = 9;
    static _LAMP_RESISTANCE = 150;
    static _WIRE_RESISTANCE = 1;
    static _LAMP_BRIGHTNESS = 4;
    static _CONTROLLER_RESISTANCE = 100;

    static _C_WAIT = 1;
    static _C_ON = 2;

    static get BATTERY_RESISTANCE() {
        return this._BATTERY_RESISTANCE;
    }

    static set BATTERY_RESISTANCE(value) {
        this._BATTERY_RESISTANCE = value;
    }

    static get BATTERY_EMF() {
        return this._BATTERY_EMF;
    }

    static set BATTERY_EMF(value) {
        this._BATTERY_EMF = value;
    }

    static get LAMP_RESISTANCE() {
        return this._LAMP_RESISTANCE;
    }

    static set LAMP_RESISTANCE(value) {
        this._LAMP_RESISTANCE = value;
    }

    static get WIRE_RESISTANCE() {
        return this._WIRE_RESISTANCE;
    }

    static set WIRE_RESISTANCE(value) {
        this._WIRE_RESISTANCE = value;
    }

    static get LAMP_BRIGHTNESS() {
        return this._LAMP_BRIGHTNESS;
    }

    static get CONTROLLER_RESISTANCE() {
        return this._CONTROLLER_RESISTANCE;
    }

    static set CONTROLLER_RESISTANCE(value) {
        this._CONTROLLER_RESISTANCE = value;
    }

    static get C_WAIT() {
        return this._C_WAIT;
    }

    static set C_WAIT(value) {
        this._C_WAIT = value;
    }

    static get C_ON() {
        return this._C_ON;
    }

    static set C_ON(value) {
        this._C_ON = value;
    }
}

window.LampConstants = LampConstants;