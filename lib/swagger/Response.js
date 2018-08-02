"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("./Schema");
const lodash_1 = require("lodash");
class Response {
    constructor(status, operation, raw) {
        this.status = status;
        this.operation = operation;
        this.raw = raw;
        Object.assign(this, lodash_1.omit(raw, 'schema'));
    }
    get name() {
        return `${this.operation.name}Response${this.status}`;
    }
    get schema() {
        if (this.raw.schema == null) {
            return null;
        }
        return new Schema_1.Schema(this.raw.schema);
    }
}
exports.Response = Response;
//# sourceMappingURL=Response.js.map