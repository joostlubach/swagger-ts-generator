"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const lodash_1 = require("lodash");
Handlebars.registerHelper('camel', function (object, opts) {
    return new Handlebars.SafeString(camel(object == null ? '' : object.toString()));
});
Handlebars.registerHelper('pascal', function (object, opts) {
    return new Handlebars.SafeString(pascal(object == null ? '' : object.toString()));
});
function camel(arg) {
    return lodash_1.camelCase(arg);
}
exports.camel = camel;
function pascal(arg) {
    return lodash_1.upperFirst(lodash_1.camelCase(arg));
}
exports.pascal = pascal;
//# sourceMappingURL=casing.js.map