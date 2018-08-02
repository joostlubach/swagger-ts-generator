"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./Schema");
class Parameter {
    constructor(raw) {
        this.raw = raw;
        Object.assign(this, raw);
    }
    get schema() {
        return new Schema_1.Schema(this.raw);
    }
    get serialization() {
        return {
            in: this.in,
            collectionFormat: this.collectionFormat
        };
    }
}
exports.Parameter = Parameter;
//# sourceMappingURL=Parameter.js.map