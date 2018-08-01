"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiDescription_1 = require("./ApiDescription");
const Logger_1 = require("./Logger");
const chalk_1 = require("chalk");
const Path = require("path");
const FS = require("fs-extra");
const Handlebars = require("handlebars");
require("./helpers");
const lodash_1 = require("lodash");
class Generator {
    constructor(options) {
        this.options = options;
        this.logger = new Logger_1.default();
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const description = yield ApiDescription_1.default.load(this.options.jsonFile);
            this.logger.log(chalk_1.default `{green ⇢} Loaded API description {yellow ${JSON.stringify(description.info.title)}}`);
            yield this.emitInfo(description);
            // await this.emitDefinitions(description)
            yield this.emitOperations(description);
        });
    }
    emitInfo(description) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(chalk_1.default `{blue ⇢} Emitting API info`);
            this.emitTemplate('info', 'info.ts', { info: description.info });
        });
    }
    emitOperations(description) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [path, entry] of Object.entries(description.paths)) {
                for (const [method, operation] of Object.entries(entry)) {
                    yield this.emitOperation(method, path, operation);
                }
            }
        });
    }
    emitOperation(method, path, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(chalk_1.default `{blue ⇢} Emitting operation {yellow ${method.toUpperCase()} ${path}}`);
            const operationId = operation.operationId || `${method.toLowerCase()}_${lodash_1.camelCase(path)}`;
            this.emitTemplate('operation', `operations/${operationId}`, operation);
        });
    }
    emitTemplate(name, path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = yield this.loadTemplate(name);
            const content = template(data);
            const outPath = this.outPath(path);
            yield FS.writeFile(outPath, content);
        });
    }
    //------
    // Paths
    outPath(path) {
        return Path.resolve(this.options.outDir, path);
    }
    //------
    // Templates
    loadTemplate(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = Path.resolve(__dirname, `../templates/${name}.ts.hb`);
            const content = yield FS.readFile(filename, 'utf-8');
            return Handlebars.compile(content);
        });
    }
}
exports.default = Generator;
//# sourceMappingURL=Generator.js.map