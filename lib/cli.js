"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandLineOptions_1 = require("./CommandLineOptions");
const Generator_1 = require("./Generator");
const chalk_1 = require("chalk");
const usage = chalk_1.default `
Usage: stsgen {bold <json-file>} {bold <out-dir>}
`;
const options = CommandLineOptions_1.default.parse(process.argv.slice(2));
if (!options.valid) {
    process.stderr.write(usage);
    process.exit(99);
}
process.on('unhandledRejection', (error) => {
    process.stderr.write(chalk_1.default `{red ${error.message}}\n`);
    if (error.stack) {
        process.stderr.write(chalk_1.default `{dim ${error.stack.split('\n').slice(1).join('\n')}}\n`);
    }
    process.exit(1);
});
const generator = new Generator_1.default(options);
generator.generate();
//# sourceMappingURL=cli.js.map