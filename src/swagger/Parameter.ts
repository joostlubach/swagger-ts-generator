import {SwaggerType} from './types'
import {Schema} from './Schema'
import {omit} from 'lodash'

export class Parameter {

  constructor(private readonly raw: AnyObject) {
    Object.assign(this, omit(raw, 'schema'))
  }

  public copy(overrides: AnyObject) {
    return new Parameter({...this.raw, ...overrides})
  }

  public name!:             string
  public in!:               'query' | 'header' | 'path' | 'formData' | 'body'
  public description!:      string
  public type!:             Exclude<SwaggerType, 'object'>
  public format!:           string
  public collectionFormat!: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi'

  get schema() {
    return new Schema(this.raw.schema || this.raw)
  }

  get serialization() {
    return {
      in:               this.in,
      collectionFormat: this.collectionFormat
    }
  }

}