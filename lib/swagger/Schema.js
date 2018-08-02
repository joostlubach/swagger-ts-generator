"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const lodash_1 = require("lodash");
class Schema {
    constructor(raw) {
        this.raw = raw;
        Object.assign(this, lodash_1.omit(raw, 'properties'));
    }
    get optional() {
        return !this.required;
    }
    get itemsSchema() {
        return new Schema(this.items || {});
    }
    get definitionRef() {
        if (this.$ref) {
            const match = this.$ref.match(/^#\/definitions\/(.*)$/);
            if (match) {
                return match[1];
            }
        }
        // Special case for enums in parameters.
        if (this.type === 'string' && this.format) {
            const match = this.format.match(/^#\/definitions\/(.*)$/);
            if (match) {
                return match[1];
            }
        }
        return null;
    }
    get definitionRefs() {
        const definitionRefs = [];
        if (this.definitionRef) {
            definitionRefs.push(this.definitionRef);
        }
        if (this.type === 'array') {
            definitionRefs.push(...this.itemsSchema.definitionRefs);
        }
        if (this.type === 'object') {
            for (const { schema } of this.properties) {
                definitionRefs.push(...schema.definitionRefs);
            }
        }
        return definitionRefs;
    }
    get isSimpleType() {
        if (this.definitionRef) {
            return true;
        }
        if (this.type == null) {
            return true;
        }
        if (this.type === 'string' && this.enum) {
            return false;
        }
        return isPrimitive(this.type);
    }
    get tsType() {
        if (this.definitionRef) {
            return this.definitionRef;
        }
        if (this.type === 'string' && this.enum) {
            return this.enum.map(opt => helpers_1.quote(opt)).join(' | ');
        }
        if (this.type === 'object') {
            return this.objectDefinition();
        }
        if (this.type === 'array') {
            return this.arrayDefinition();
        }
        if (this.type != null) {
            return mapTypeToTS(this.type);
        }
        return 'any';
    }
    objectDefinition() {
        if (this.type !== 'object') {
            return null;
        }
        const pairs = [];
        for (const [key, schemaDef] of Object.entries(this.properties || [])) {
            const schema = new Schema(schemaDef);
            pairs.push(`${helpers_1.sanitizeKey(key)}: ${schema.tsType}`);
        }
    }
    arrayDefinition() {
        if (this.itemsSchema.isSimpleType) {
            return `${this.itemsSchema.tsType}[]`;
        }
        else {
            return `Array<${this.itemsSchema.tsType}>`;
        }
    }
    get properties() {
        return Object.entries(this.raw.properties || {})
            .map(([name, schema]) => ({ name, schema: new Schema(schema) }));
    }
}
exports.Schema = Schema;
function isPrimitive(type) {
    return type !== 'object' && type !== 'array';
}
exports.isPrimitive = isPrimitive;
function mapTypeToTS(type) {
    switch (type) {
        case 'integer': return 'number';
        case 'array': return 'any[]';
        default: return type;
    }
}
exports.mapTypeToTS = mapTypeToTS;
//# sourceMappingURL=Schema.js.map