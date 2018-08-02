"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const lodash_1 = require("lodash");
const _1 = require(".");
const quote_1 = require("./quote");
Handlebars.registerHelper('emit', function (object, opts) {
    return new Handlebars.SafeString(emit(object, Object.assign({ indent: 0 }, opts.hash)));
});
function emit(object, options = {}) {
    if (lodash_1.isArray(object)) {
        return emitArray(object, options);
    }
    else if (lodash_1.isPlainObject(object)) {
        return emitObject(object, options);
    }
    else if (typeof object === 'string') {
        return quote_1.quote(object);
    }
    else {
        return JSON.stringify(object);
    }
}
exports.emit = emit;
function emitArray(array, options = {}) {
    const lines = [];
    lines.push(`[`);
    for (const item of array) {
        lines.push(emit(item, { indent: (options.indent || 0) + 1 }));
    }
    lines.push(`${indent(options)}]`);
    return lines.join(options.inline ? '' : '\n');
}
exports.emitArray = emitArray;
function emitObject(object, options) {
    const lines = [];
    lines.push(`{`);
    for (const [key, value] of Object.entries(object)) {
        if (value === undefined && !options.emitUndefined) {
            continue;
        }
        const childOptions = Object.assign({}, options, { indent: (options.indent || 0) + 1 });
        lines.push(`${indent(childOptions)}${_1.sanitizeKey(key)}: ${emit(value, childOptions)},`);
    }
    if (lines.length) {
        lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
    }
    lines.push(`${indent(options)}}`);
    return lines.join(options.inline ? '' : '\n');
}
exports.emitObject = emitObject;
function indent(options) {
    if (options.inline) {
        return '';
    }
    return Array((options.indent || 0) + 1).join('  ');
}
//# sourceMappingURL=emit.js.map