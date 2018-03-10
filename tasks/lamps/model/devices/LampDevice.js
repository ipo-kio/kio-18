import {ResistanceDevice} from "./ResistanceDevice";
import {LampConstants} from "../LampConstants";

export class LampDevice extends ResistanceDevice {

    _color; //as three numbers array
    _type;

    constructor(color, type=0) {
        super(LampConstants.LAMP_RESISTANCE);
        this._color = color;
        this._type = type;
    }

    get_info(array_of_currencies) {
        let info = super.get_info(array_of_currencies);
        let c = info.currencies[0];
        info.power = c * c * LampConstants.LAMP_RESISTANCE * LampConstants.LAMP_BRIGHTNESS;
        return info;
    }

    color(alpha) {
        let [r, g, b] = this._color;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(2) + ')';
    }

    get type() {
        return this._type;
    }
}