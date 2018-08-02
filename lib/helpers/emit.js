"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const lodash_1 = require("lodash");
const _1 = require(".");
Handlebars.registerHelper('emit', function (object, opts) {
    return new Handlebars.SafeString(emit(object, Object.assign({ indent: 0 }, opts.hash)));
});
function emit(object, options) {
    if (lodash_1.isArray(object)) {
        return emitArray(object, options);
    }
    else if (lodash_1.isPlainObject(object)) {
        return emitObject(object, options);
    }
    else {
        return JSON.stringify(object);
    }
}
exports.emit = emit;
function emitArray(array, options) {
    const lines = [];
    lines.push(`[`);
    for (const item of array) {
        lines.push(emit(item, { indent: options.indent + 1 }));
    }
    lines.push(`${indent(options.indent)}]`);
    return lines.join('\n');
}
exports.emitArray = emitArray;
function emitObject(object, options) {
    const lines = [];
    lines.push(`{`);
    for (const [key, value] of Object.entries(object)) {
        lines.push(`${indent(options.indent + 1)}${_1.sanitizeKey(key)}: ${emit(value, { indent: options.indent + 1 })},`);
    }
    lines.push(`${indent(options.indent)}}`);
    return lines.join('\n');
}
exports.emitObject = emitObject;
function indent(level) {
    return Array(level + 1).join('  ');
}
//# sourceMappingURL=emit.js.map