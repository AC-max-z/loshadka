"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID = void 0;
class UUID {
    constructor(str) {
        this.str = str || UUID.getNewUUIDString();
    }
    toString() {
        return this.str;
    }
    static getNewUUIDString() {
        // your favourite guid generation function could go here
        // ex: http://stackoverflow.com/a/8809472/188246
        let d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    }
}
exports.UUID = UUID;
//# sourceMappingURL=uuid.js.map