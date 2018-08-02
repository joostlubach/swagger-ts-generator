"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parameter_1 = require("./Parameter");
const Response_1 = require("./Response");
const lodash_1 = require("lodash");
class Operation {
    constructor(method, path, raw) {
        this.method = method;
        this.path = path;
        this.raw = raw;
        Object.assign(this, lodash_1.omit(raw, 'parameters', 'responses'));
    }
    get name() {
        return lodash_1.upperFirst(lodash_1.camelCase(this.operationId));
    }
    get call() {
        return lodash_1.lowerFirst(lodash_1.camelCase(this.operationId));
    }
    get definitionImports() {
        const imports = [];
        for (const parameter of this.parameters) {
            imports.push(...parameter.schema.definitionRefs);
        }
        for (const response of this.responses) {
            if (response.schema) {
                imports.push(...response.schema.definitionRefs);
            }
        }
        return imports;
    }
    get parameters() {
        return this.raw.parameters.map((raw) => new Parameter_1.Parameter(raw));
    }
    get responses() {
        return this.successResponses.concat(this.errorResponses);
    }
    get paramsSerialization() {
        const serialization = {};
        for (const parameter of this.parameters) {
            serialization[parameter.name] = parameter.serialization;
        }
        return serialization;
    }
    get successResponses() {
        const statuses = Object.keys(this.raw.responses)
            .map(s => parseInt(s, 10))
            .filter(isSuccessStatus);
        return statuses.map(status => new Response_1.Response(status, this, this.raw.responses[status]));
    }
    get errorResponses() {
        const statuses = Object.keys(this.raw.responses)
            .map(s => parseInt(s, 10))
            .filter(isErrorStatus);
        return statuses.map(status => new Response_1.Response(status, this, this.raw.responses[status]));
    }
}
exports.Operation = Operation;
function isSuccessStatus(status) {
    return status >= 200 && status < 400;
}
function isErrorStatus(status) {
    return !isSuccessStatus(status);
}
//# sourceMappingURL=Operation.js.map