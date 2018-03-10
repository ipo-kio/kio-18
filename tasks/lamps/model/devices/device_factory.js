import {LampDevice} from "./LampDevice";
import {ControllerDevice} from "./ControllerDevice";
import {WireDevice} from "./WireDevice1";
import {RotatedDevice} from "./RotatedDevice";
import {UpDownDevice} from "./UpDownDevice";
import {BatteryDevice} from "./BatteryDevice";

function tag(d, t) {
    if (t === undefined)
        return d.SERIALIZE_TAG;
    else {
        d.SERIALIZE_TAG = t;
        return d;
    }
}

export class DeviceFactory {

    static create_red_lamp(type=0) {
        return tag(new LampDevice([255, 0, 0], type), 'rl' + type);
    }

    static create_yellow_lamp(type=0) {
        return tag(new LampDevice([255, 255, 0], type), 'yl' + type);
    }

    static create_green_lamp(type=0) {
        return tag(new LampDevice([0, 255, 0], type), 'gl' + type);
    }

    static create_blue_lamp(type=0) {
        return tag(new LampDevice([0, 0, 255], type), 'bl' + type);
    }

    static create_controller(c_wait, c_on, state = 0) {
        return tag(new ControllerDevice(c_wait, c_on, state), 'c' + c_wait + c_on);
    }

    static create_wire(size) {
        return tag(new WireDevice(size), 'w' + size);
    }

    static create_rotated(device) {
        return tag(new RotatedDevice(device), '_r' + tag(device));
    }

    static create_updown(device) {
        return tag(new UpDownDevice(device), '_u' + tag(device));
    }

    static create_battery() {
        return tag(new BatteryDevice(), 'b');
    }
    
    static serialize(device) {
        return tag(device);
    }
    
    static deserialize(id) {
        if (id === null || id === undefined)
            return null;

        if (id.substr(0, 2) === 'rl')
            return DeviceFactory.create_red_lamp(+id.substr(3));
        if (id.substr(0, 2) === 'yl')
            return DeviceFactory.create_yellow_lamp(+id.substr(3));
        if (id.substr(0, 2) === 'gl')
            return DeviceFactory.create_green_lamp(+id.substr(3));
        if (id.substr(0, 2) === 'bl')
            return DeviceFactory.create_blue_lamp(+id.substr(3));
        
        if (id.substr(0, 1) === 'c')
            return DeviceFactory.create_controller(+id.substr(1, 1), +id.substr(2, 1));

        if (id === 'b')
            return DeviceFactory.create_battery();

        if (id.substr(0, 1) === 'w')
            return DeviceFactory.create_wire(id.substr(1, 1));

        if (id.substr(0, 2) === '_r')
            return new RotatedDevice(DeviceFactory.deserialize(id.substr(2)));
        if (id.substr(0, 2) === '_u')
            return new UpDownDevice(DeviceFactory.deserialize(id.substr(2)));

        return null;
    }
}