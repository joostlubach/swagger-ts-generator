import {Operation} from './Operation'
import {Schema} from './Schema'
import {omit} from 'lodash'

export class Response {

  constructor(
    public readonly status: number,
    public readonly operation: Operation,
    private readonly raw: AnyObject
  ) {
    Object.assign(this, omit(raw, 'schema'))
  }

  description!: string
  
  get name() {
    return `${this.operation.name}Response${this.status}`
  }

  get schema() {
    if (this.raw.schema == null) { return null }
    return new Schema(this.raw.schema)
  }

}