import { CarPosition } from '../../types/car-position';

export class CarPositionGenerator {
    public static generateListOfPositions(amount: number): CarPosition[] {
        const arrOfPositions = [];
        for (let i = 0; i < amount; i++) {
            arrOfPositions.push(this.generatePosition());
        }
        return arrOfPositions;
    }

    public static generatePosition(): CarPosition {
        return new CarPosition();
    }
}
