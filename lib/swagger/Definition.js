"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Schema_1 = require("./Schema");
class Definition {
    constructor(name, raw) {
        this.name = name;
        this.raw = raw;
        Object.assign(this, lodash_1.omit(raw, 'properties'));
    }
    get schema() {
        return new Schema_1.Schema(this.raw);
    }
    get isObject() {
        return this.schema.type === 'object';
    }
    get definitionImports() {
        const imports = [];
        for (const ref of this.schema.definitionRefs) {
            imports.push(ref);
        }
        return imports.length === 0 ? null : imports;
    }
}
exports.Definition = Definition;
//# sourceMappingURL=Definition.js.map