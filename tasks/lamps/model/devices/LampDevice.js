import {ResistanceDevice} from "./ResistanceDevice";
import {LampConstants} from "../LampConstants";

export class LampDevice extends ResistanceDevice {

    constructor() {
        super(LampConstants.LAMP_RESISTANCE);
    }


    get_info(array_of_currencies) {
        let info = super.get_info(array_of_currencies);
        let c = info.currencies[0];
        info.power = c * c * LampConstants.LAMP_RESISTANCE * LampConstants.LAMP_BRIGHTNESS;
        return info;
    }
}