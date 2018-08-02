"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const quote_1 = require("./quote");
Handlebars.registerHelper('sanitizeKey', function (key, opts) {
    return new Handlebars.SafeString(sanitizeKey(key));
});
function sanitizeKey(key) {
    if (typeof key !== 'string') {
        return `[${JSON.stringify(key)}]`;
    }
    if (/[^a-zA-Z]/.test(key)) {
        return quote_1.quote(key);
    }
    return key;
}
exports.sanitizeKey = sanitizeKey;
//# sourceMappingURL=sanitizeKey.js.map