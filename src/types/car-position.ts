import { UUID } from './uuid';

type CarId = {
    value: string | number | UUID;
};

type PositionId = {
    value: string | number;
};

type Imei = {
    value: string;
};

interface NavigationData {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    hdop: number;
    valid: boolean;
}

interface AccelerometerData {
    side: Side;
    startTime: Date;
    duration: number; // Duration?
    mean: number;
    arrType: number | null;
    arrTm: number[];
    arrAcc: number[];
    vals: number[];
}

enum Side {
    XF = 'XF',
    XB = 'XB',
    YF = 'YF',
    YB = 'YB',
    ZF = 'ZF',
    ZB = 'ZB',
    LAST = 'LAST',
}

interface DeviceSensor {
    TODO: 'Implement me!';
}

interface VehicleSensor {
    TODO: 'Implement me!';
}

interface Position {
    id: PositionId;
    imei: Imei;
    fixTime: Date;
    serverTime: Date;
    valid: boolean;
    navigationData: NavigationData | null;
    accelerometerData: AccelerometerData | null;
    deviceSensors: DeviceSensor[];
    vehicleSensors: VehicleSensor[];
}

export class CarPosition {
    carId: string;
    position: Position | string; // TODO: fix this shit later
    constructor() {
        this.carId = new UUID().toString();
        this.position = 'Pohuy';
    }
}
