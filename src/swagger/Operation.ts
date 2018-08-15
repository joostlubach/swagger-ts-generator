import {Parameter} from './Parameter'
import {Response} from './Response'
import {omit, upperFirst, lowerFirst, camelCase} from 'lodash'

export class Operation {

  constructor(
    public readonly method: string,
    public readonly path: string,
    private readonly raw: AnyObject
  ) {
    Object.assign(this, omit(raw, 'parameters', 'responses'))
  }

  operationId!: string

  summary!: string
  tags!: string[]

  produces!: string[]
  consumes!: string[]

  get name() {
    return upperFirst(camelCase(this.operationId))
  }

  get call() {
    return lowerFirst(camelCase(this.operationId))
  }

  get definitionImports() {
    const imports: string[] = []

    for (const parameter of this.parameters) {
      imports.push(...parameter.schema.definitionRefs)
    }
    for (const response of this.responses) {
      if (response.schema) {
        imports.push(...response.schema.definitionRefs)
      }
    }

    return imports
  }

  get parameters(): Parameter[] {
    const {parameters} = this.raw
    if (parameters == null) { return [] }
    
    return parameters.map((raw: any) => new Parameter(raw))
  }

  get responses(): Response[] {
    return this.successResponses.concat(this.errorResponses)
  }

  get paramsSerialization() {
    const serialization: AnyObject = {}
    for (const parameter of this.parameters) {
      serialization[parameter.name] = parameter.serialization
    }
    return serialization
  }

  get successResponses(): Response[] {
    const statuses = Object.keys(this.raw.responses)
      .map(s => parseInt(s, 10))
      .filter(isSuccessStatus)

      return statuses.map(status => new Response(status, this, this.raw.responses[status]))
  }

  get errorResponses(): Response[] {
    const statuses = Object.keys(this.raw.responses)
      .map(s => parseInt(s, 10))
      .filter(isErrorStatus)

    return statuses.map(status => new Response(status, this, this.raw.responses[status]))
  }

}

function isSuccessStatus(status: number) {
  return status >= 200 && status < 400
}

function isErrorStatus(status: number) {
  return !isSuccessStatus(status)
}