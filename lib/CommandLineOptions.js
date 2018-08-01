"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const argv = minimist(process.argv);
class CommandLineOptions {
    constructor(args) {
        this.args = args;
        this.jsonFile = args._[0];
        this.outDir = args._[1];
    }
    static parse(argv) {
        const opts = minimist(argv);
        return new CommandLineOptions(opts);
    }
    get valid() {
        if (this.jsonFile == null) {
            return false;
        }
        if (this.outDir == null) {
            return false;
        }
        return true;
    }
}
exports.default = CommandLineOptions;
//# sourceMappingURL=CommandLineOptions.js.map