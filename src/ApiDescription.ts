import * as FS from 'fs-extra'

export interface Info {
  title:       string
  description: string
}

export type Operations = {
  [key in 'get' | 'post' | 'put' | 'patch' | 'delete']: Operation
}

export interface Operation {
  operationId: string

  summary: string
  tags: string[]

  produces: string[]
  consumes: string[]

  parameters: Parameter[]
}

export interface Parameter {
  name: string
  in:          'query' | 'body' | 'headers'
  description: string
  type:        'string' | 'number' | 'object' | 'array'
  format:      string
}

export default class ApiDescription {

  constructor(public readonly raw: AnyObject) {}

  public static async load(file: string) {
    const content = await FS.readFile(file, 'utf-8')
    const raw = JSON.parse(content)

    return new ApiDescription(raw)
  }

  get info(): Info {
    return this.raw.info
  }

  get paths(): {[path: string]: Operations} {
    return this.raw.paths
  }

}