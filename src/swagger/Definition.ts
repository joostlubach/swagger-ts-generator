import {omit} from 'lodash'
import {Schema} from './Schema'

export class Definition {

  constructor(
    public readonly name: string,
    private readonly raw: AnyObject
  ) {}

  get schema() {
    return new Schema(this.raw)
  }

  get isObject() {
    return this.schema.type === 'object'
  }

  get definitionImports() {
    const imports: string[] = []

    for (const ref of this.schema.definitionRefs) {
      imports.push(ref)
    }

    return imports.length === 0 ? null : imports
  }

}