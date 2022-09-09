"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarPositionGenerator = void 0;
const car_position_1 = require("../../types/car-position");
class CarPositionGenerator {
    static generateListOfPositions(amount) {
        const arrOfPositions = [];
        for (let i = 0; i < amount; i++) {
            arrOfPositions.push(this.generatePosition());
        }
        return arrOfPositions;
    }
    static generatePosition() {
        return new car_position_1.CarPosition();
    }
}
exports.CarPositionGenerator = CarPositionGenerator;
//# sourceMappingURL=car-positions-generator.js.map