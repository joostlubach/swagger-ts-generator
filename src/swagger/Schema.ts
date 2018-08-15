import {SwaggerType} from './types'
import {sanitizeKey, quote} from '../helpers'
import {omit} from 'lodash'

export class Schema {

  constructor(private readonly raw: AnyObject) {
    Object.assign(this, omit(raw, 'properties'))
  }

  public $ref?: string
  public type?: SwaggerType

  // type === 'string'
  public format?: string
  public enum?:   string[]

  // type === 'array'
  public items?: Schema

  // type === 'object'
  public required?: string[]

  public get optional() {
    return !this.required
  }

  public get itemsSchema() {
    return new Schema(this.items || {})
  }

  public get definitionRef() {
    if (this.$ref) {
      const match = this.$ref.match(/^#\/definitions\/(.*)$/)
      if (match) { return match[1] }
    }

    // Special case for enums in parameters.
    if (this.type === 'string' && this.format) {
      const match = this.format.match(/^#\/definitions\/(.*)$/)
      if (match) { return match[1] }
    }

    return null
  }

  public get definitionRefs() {
    const definitionRefs: string[] = []
    
    if (this.definitionRef) {
      definitionRefs.push(this.definitionRef)
    }

    if (this.type === 'array') {
      definitionRefs.push(...this.itemsSchema.definitionRefs)
    }

    if (this.type === 'object') {
      for (const {schema} of this.properties) {
        definitionRefs.push(...schema.definitionRefs)
      }
    }

    return definitionRefs
  }

  public get isSimpleType() {
    if (this.definitionRef) { return true }
    if (this.type == null) { return true }
    if (this.type === 'string' && this.enum) { return false }

    return isPrimitive(this.type)
  }

  public get tsType(): string {
    if (this.definitionRef) {
      return this.definitionRef
    }

    if (this.type === 'string' && this.enum) {
      return this.enum.map(opt => quote(opt)).join(' | ')
    }

    if (this.type === 'object') {
      return this.objectDefinition()!
    }

    if (this.type === 'array') {
      return this.arrayDefinition()!
    }

    if (this.type != null) {
      return mapTypeToTS(this.type)
    }

    return 'any'
  }

  public objectDefinition() {
    if (this.type !== 'object') { return null }

    const pairs = []
    for (const {name, schema} of this.properties) {
      pairs.push(`${sanitizeKey(name)}: ${schema.tsType}`)
    }
    return '{' + pairs.join(', ') + '}'
  }

  public arrayDefinition() {
    if (this.itemsSchema.isSimpleType) {
      return `${this.itemsSchema.tsType}[]`
    } else {
      return `Array<${this.itemsSchema.tsType}>`
    }
  }

  public get properties() {
    return Object.entries(this.raw.properties || {})
      .map(([name, schema]) => ({name, schema: new Schema(schema)}))
  }

}

export function isPrimitive(type: SwaggerType) {
  return type !== 'object' && type !== 'array'
}

export function mapTypeToTS(type: SwaggerType) {
  switch (type) {
  case 'integer': return 'number'
  case 'array':   return 'any[]'
  default:        return type
  }
}