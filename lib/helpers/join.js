"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const lodash_1 = require("lodash");
Handlebars.registerHelper('join', function (object, opts) {
    return new Handlebars.SafeString(join(lodash_1.isArray(object) ? object : [object], opts.hash.separator));
});
function join(arg, separator) {
    return arg.map(a => a == null ? '' : a.toString()).join(separator);
}
exports.join = join;
//# sourceMappingURL=join.js.map