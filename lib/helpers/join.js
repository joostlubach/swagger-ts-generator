"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
const lodash_1 = require("lodash");
Handlebars.registerHelper('join', function (object, opts) {
    let arr = lodash_1.isArray(object) ? object : [object];
    if (opts.fn) {
        arr = arr.map(i => opts.fn(i, opts));
    }
    return new Handlebars.SafeString(join(arr, opts.hash.separator));
});
function join(arg, separator) {
    return arg.map(a => a == null ? '' : a.toString()).join(separator);
}
exports.join = join;
//# sourceMappingURL=join.js.map