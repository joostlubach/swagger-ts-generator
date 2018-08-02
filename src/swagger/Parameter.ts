import {SwaggerType} from './types'
import {Schema} from './Schema'

export class Parameter {

  constructor(private readonly raw: AnyObject) {
    Object.assign(this, raw)
  }

  name!:             string
  in!:               'query' | 'header' | 'path' | 'formData' | 'body'
  description!:      string
  type!:             Exclude<SwaggerType, 'object'>
  format!:           string
  collectionFormat!: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi'

  get schema() {
    return new Schema(this.raw)
  }

  get serialization() {
    return {
      in:               this.in,
      collectionFormat: this.collectionFormat
    }
  }

}