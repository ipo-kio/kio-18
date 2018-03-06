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

    static create_red_lamp() {
        return tag(new LampDevice([255, 0, 0]), 'rl');
    }

    static create_yellow_lamp() {
        return tag(new LampDevice([255, 255, 0]), 'yl');
    }

    static create_green_lamp() {
        return tag(new LampDevice([0, 255, 0]), 'gl');
    }

    static create_blue_lamp() {
        return tag(new LampDevice([0, 0, 255]), 'bl');
    }

    static create_controller(state = 0) {
        return tag(new ControllerDevice(state), 'c');
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
        if (id === 'rl')
            return DeviceFactory.create_red_lamp();
        if (id === 'yl')
            return DeviceFactory.create_yellow_lamp();
        if (id === 'gl')
            return DeviceFactory.create_green_lamp();
        if (id === 'bl')
            return DeviceFactory.create_blue_lamp();
        
        if (id === 'c')
            return DeviceFactory.create_controller();

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