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
const FS = require("fs-extra");
const Operation_1 = require("./Operation");
const Definition_1 = require("./Definition");
class ApiDescription {
    constructor(raw) {
        this.raw = raw;
    }
    static load(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield FS.readFile(file, 'utf-8');
            const raw = JSON.parse(content);
            return new ApiDescription(raw);
        });
    }
    get info() {
        return this.raw.info;
    }
    get paths() {
        return Object.keys(this.raw.paths);
    }
    methodsForPath(path) {
        const entries = this.raw.paths[path];
        if (entries == null) {
            return [];
        }
        return Object.keys(entries);
    }
    get operations() {
        const operations = [];
        for (const path of this.paths) {
            for (const method of this.methodsForPath(path)) {
                const operation = this.getOperation(path, method);
                if (operation) {
                    operations.push(operation);
                }
            }
        }
        return operations;
    }
    getOperation(path, method) {
        const byMethod = this.raw.paths[path] || {};
        const operation = byMethod[method];
        return operation == null ? null : new Operation_1.Operation(method, path, operation);
    }
    get definitions() {
        return Object.entries(this.raw.definitions)
            .map(([name, definition]) => new Definition_1.Definition(name, definition));
    }
}
exports.ApiDescription = ApiDescription;
//# sourceMappingURL=ApiDescription.js.map