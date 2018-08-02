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
const swagger_1 = require("./swagger");
const Logger_1 = require("./Logger");
const chalk_1 = require("chalk");
const Path = require("path");
const FS = require("fs-extra");
const Handlebars = require("handlebars");
require("./helpers");
class Generator {
    constructor(options) {
        this.options = options;
        this.logger = new Logger_1.default();
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const description = yield swagger_1.ApiDescription.load(this.options.jsonFile);
            this.logger.log(chalk_1.default `{green ⇢} Loaded API description {yellow ${JSON.stringify(description.info.title)}}`);
            yield this.emitSkeleton();
            yield this.emitRequestHelper();
            yield this.emitInfo(description);
            yield this.emitDefinitions(description);
            yield this.emitOperations(description);
        });
    }
    emitSkeleton() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(chalk_1.default `{blue ⇢} Emitting skeleton structure`);
            yield this.emitTemplate('index', 'index.ts', {
                index: [
                    { export: '*', from: './operations' },
                    { export: '*', from: './definitions' },
                ]
            });
            yield this.emitTemplate('types', 'types.ts', {});
            yield this.emitTemplate('helpers', 'helpers.ts', {});
        });
    }
    emitRequestHelper() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield FS.pathExists(this.outPath('request.ts'))) {
                this.logger.log(chalk_1.default `{yellow ⇢} Skipping generation of request helper`);
            }
            else {
                this.logger.log(chalk_1.default `{blue ⇢} Emitting request helper`);
                yield this.emitTemplate('request', 'request.ts', {});
            }
        });
    }
    emitInfo(description) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(chalk_1.default `{blue ⇢} Emitting API info`);
            yield this.emitTemplate('info', 'info.ts', { info: description.info });
        });
    }
    emitDefinitions(description) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const definition of description.definitions) {
                yield this.emitDefinition(definition);
            }
            yield this.emitTemplate('index', 'definitions/index.ts', {
                index: description.definitions.map(d => ({ export: '*', from: `./${d.name}` }))
            });
        });
    }
    emitDefinition(definition) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = definition;
            this.logger.log(chalk_1.default `{blue ⇢} Emitting definition {yellow ${name}}`);
            yield this.emitTemplate('definition', `definitions/${name}.ts`, definition);
        });
    }
    emitOperations(description) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const operation of description.operations) {
                yield this.emitOperation(operation);
            }
            yield this.emitTemplate('index', 'operations/index.ts', {
                index: description.operations.map(d => ({ export: '*', from: `./${d.call}` }))
            });
        });
    }
    emitOperation(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            const { method, path } = operation;
            this.logger.log(chalk_1.default `{blue ⇢} Emitting operation {yellow ${method.toUpperCase()} ${path}}`);
            yield this.emitTemplate('operation', `operations/${operation.call}.ts`, operation);
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
            return Handlebars.compile(content, { noEscape: true });
        });
    }
}
exports.default = Generator;
//# sourceMappingURL=Generator.js.map