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

  public readonly operationId!: string

  public readonly summary!: string
  public readonly tags!: string[]

  public readonly produces!: string[]
  public readonly consumes!: string[]

  public get name() {
    return upperFirst(camelCase(this.operationId))
  }

  public get call() {
    return lowerFirst(camelCase(this.operationId))
  }

  public get definitionImports() {
    const imports: Set<string> = new Set()

    for (const parameter of this.parameters) {
      for (const ref of parameter.schema.definitionRefs) {
        imports.add(ref)
      }
    }
    for (const response of this.responses) {
      if (!response.schema) { continue }
      for (const ref of response.schema.definitionRefs) {
        imports.add(ref)
      }
    }

    return [...imports]
  }

  public get parameters(): Parameter[] {
    const {parameters} = this.raw
    if (parameters == null) { return [] }
    
    return parameters.map((raw: any) => new Parameter(raw))
  }

  public get responses(): Response[] {
    return this.successResponses.concat(this.errorResponses)
  }

  public get paramsSerialization() {
    const serialization: AnyObject = {}
    for (const parameter of this.parameters) {
      serialization[parameter.name] = parameter.serialization
    }
    return serialization
  }

  public get successResponses(): Response[] {
    const statuses = Object.keys(this.raw.responses)
      .map(s => parseInt(s, 10))
      .filter(isSuccessStatus)

      return statuses.map(status => new Response(status, this, this.raw.responses[status]))
  }

  public get errorResponses(): Response[] {
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