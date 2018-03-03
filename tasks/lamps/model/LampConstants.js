export class LampConstants {

    static _BATTERY_RESISTANCE = 34;
    static _BATTERY_EMF = 9;
    static _LAMP_RESISTANCE = 150;
    static _WIRE_RESISTANCE = 0;

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
}

window.LampConstants = LampConstants;