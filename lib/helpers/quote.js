"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handlebars = require("handlebars");
Handlebars.registerHelper('quote', function (object, opts) {
    return new Handlebars.SafeString(quote(object == null ? '' : object.toString()));
});
function quote(arg) {
    return `'${arg.replace('\'', '\\\'')}'`;
}
exports.quote = quote;
//# sourceMappingURL=quote.js.map