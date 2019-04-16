import {SwaggerType} from './types'
import {sanitizeKey, quote} from '../helpers'
import {omit, isArray} from 'lodash'

export class Schema {

  constructor(private readonly raw: AnyObject) {
    Object.assign(this, omit(raw, 'properties', 'additionalProperties'))
  }

  [key: string]: any

  public $ref?: string
  public type?: SwaggerType

  // type === 'string'
  public format?: string
  public enum?:   string[]

  // type === 'array'
  public items?: Schema

  // type === 'object'
  public required?: boolean

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
    const definitionRefs: Set<string> = new Set()
    
    if (this.definitionRef) {
      definitionRefs.add(this.definitionRef)
    }

    if (this.type === 'array') {
      for (const ref of this.itemsSchema.definitionRefs) {
        definitionRefs.add(ref)
      }
    }

    if (this.type === 'object') {
      for (const {schema} of this.properties) {
        for (const ref of schema.definitionRefs) {
          definitionRefs.add(ref)
        }
      }
      
      if (this.additionalProperties) {
        const schema = this.additionalProperties
        for (const ref of schema.definitionRefs) {
          definitionRefs.add(ref)
        }
      }
    }

    for (const ref of this.composedDefinitionRefs) {
      definitionRefs.add(ref)
    }

    return [...definitionRefs]
  }

  public get composedDefinitionRefs(): string[] {
    const definitionRefs: Set<string> = new Set()

    for (const schema of this.composedSchemas) {
      for (const ref of schema.definitionRefs) {
        definitionRefs.add(ref)
      }
    }

    return [...definitionRefs]
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
    if (this.additionalProperties) {
      const schema = this.additionalProperties
      let pair = `[key: string]: ${schema.tsType}`
      if (schema['x-nullable']) { pair += ' | null' }
      pairs.push(pair)
    }

    for (const {name, schema} of this.properties) {
      let pair = `${sanitizeKey(name)}${schema.optional ? '?' : ''}: ${schema.tsType}`
      if (schema['x-nullable']) { pair += ' | null' }
      pairs.push(pair)
    }

    const {composedDefinitionRefs} = this
    const composed = composedDefinitionRefs.length > 0
      ? `${composedDefinitionRefs.join(' & ')} & `
      : ''

    return composed + '{' + pairs.join(', ') + '}'
  }

  public arrayDefinition() {
    if (this.itemsSchema.isSimpleType) {
      return `${this.itemsSchema.tsType}[]`
    } else {
      return `Array<${this.itemsSchema.tsType}>`
    }
  }

  public get composedSchemas(): Schema[] {
    return (this.raw.allOf || [])
      .map((schema: any) => new Schema(schema))
  }

  public get properties() {
    const properties: {[name: string]: Schema} = {}

    // First add properties from composed schemas.
    for (const schema of this.composedSchemas) {
      Object.assign(properties, schema.properties)
    }

    // Add our own properties.
    for (const [name, json] of Object.entries(this.raw.properties || {})) {
      properties[name] = new Schema(json)
    }

    // Mark required properties.
    for (const name of this.requiredPropertyNames) {
      properties[name].required = true
    }

    return Object.entries(properties).map(([name, schema]) => ({name, schema}))
  }

  public get requiredPropertyNames(): string[] {
    const names: Set<string> = new Set()

    for (const schema of this.composedSchemas) {
      for (const name of schema.requiredPropertyNames) {
        names.add(name)
      }
    }

    if (isArray(this.raw.required)) {
      for (const name of this.raw.required) {
        names.add(name)
      }
    }

    return [...names]
  }

  public get additionalProperties(): Schema | undefined {
    if (this.raw.additionalProperties === true) {
      return new Schema({})
    } else if (this.raw.additionalProperties != null) {
      return new Schema(this.raw.additionalProperties)
    }

    // Check any of the composed schemas, in reversed order (last one has precedence).
    for (const schema of this.composedSchemas.reverse()) {
      const additional = schema.additionalProperties
      if (additional != null) { return additional }
    }

    // Not found.
    return undefined
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