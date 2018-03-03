import {ResistanceDevice} from "./ResistanceDevice";
import {LampConstants} from "../LampConstants";

export class LampDevice extends ResistanceDevice {

    constructor() {
        super(LampConstants.LAMP_RESISTANCE);
    }
}