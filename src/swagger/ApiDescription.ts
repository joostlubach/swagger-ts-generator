import * as FS from 'fs-extra'
import {Operation} from './Operation'
import {Definition} from './Definition'

export interface Info {
  title:       string
  description: string
}

export type Operations = {
  [key in 'get' | 'post' | 'put' | 'patch' | 'delete']: Operation
}

export class ApiDescription {

  constructor(public readonly raw: AnyObject) {}

  public static async load(file: string) {
    const content = await FS.readFile(file, 'utf-8')
    const raw = JSON.parse(content)

    return new ApiDescription(raw)
  }

  get info(): Info {
    return this.raw.info
  }

  get paths(): string[] {
    return Object.keys(this.raw.paths)
  }

  methodsForPath(path: string): string[] {
    const entries = this.raw.paths[path]
    if (entries == null) { return [] }

    return Object.keys(entries)
  }

  get operations(): Operation[] {
    const operations: Operation[] = []
    for (const path of this.paths) {
      for (const method of this.methodsForPath(path)) {
        const operation = this.getOperation(path, method)
        if (operation) { operations.push(operation) }
      }
    }

    return operations
  }

  getOperation(path: string, method: string) {
    const byMethod = this.raw.paths[path] || {}
    const operation = byMethod[method]

    return operation == null ? null : new Operation(method, path, operation)
  }

  get definitions() {
    return Object.entries(this.raw.definitions)
      .map(([name, definition]) => new Definition(name, definition))
  }

}