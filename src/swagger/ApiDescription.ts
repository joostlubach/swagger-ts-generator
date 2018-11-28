import * as FS from 'fs-extra'
import fetch from 'node-fetch'
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

  public static async load(pathOrURL: string) {
    let json: any
    if (/https?:\/\//.test(pathOrURL)) {
      json = await this.fetch(pathOrURL)
    } else {
      const content = await FS.readFile(pathOrURL, 'utf-8')
      json = JSON.parse(content)
    }

    return new ApiDescription(json)
  }

  private static async fetch(url: string) {
    const response = await fetch(url)
    if (response.status !== 200) {
      throw new Error(`Could not load JSON from \`${url}\` (HTTP ${response.status})`)
    }
    
    return await response.json()
  }

  public get info(): Info {
    return this.raw.info
  }

  public get paths(): string[] {
    return Object.keys(this.raw.paths)
  }

  public methodsForPath(path: string): string[] {
    const entries = this.raw.paths[path]
    if (entries == null) { return [] }

    return Object.keys(entries)
  }

  public get operations(): Operation[] {
    const operations: Operation[] = []
    for (const path of this.paths) {
      for (const method of this.methodsForPath(path)) {
        const operation = this.getOperation(path, method)
        if (operation) { operations.push(operation) }
      }
    }

    return operations
  }

  public getOperation(path: string, method: string) {
    const byMethod = this.raw.paths[path] || {}
    const operation = byMethod[method]

    return operation == null ? null : new Operation(method, path, operation)
  }

  public get definitions() {
    return Object.entries(this.raw.definitions)
      .map(([name, definition]) => new Definition(name, definition))
  }

}