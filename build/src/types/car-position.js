"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarPosition = void 0;
const uuid_1 = require("./uuid");
var Side;
(function (Side) {
    Side["XF"] = "XF";
    Side["XB"] = "XB";
    Side["YF"] = "YF";
    Side["YB"] = "YB";
    Side["ZF"] = "ZF";
    Side["ZB"] = "ZB";
    Side["LAST"] = "LAST";
})(Side || (Side = {}));
class CarPosition {
    constructor() {
        this.carId = new uuid_1.UUID().toString();
        this.position = 'Pohuy';
    }
}
exports.CarPosition = CarPosition;
//# sourceMappingURL=car-position.js.map