import {SwaggerOperation} from '../types'
import {NoConnectionResponse, ParamsSerialization} from '../types'
import {serializeParameters, prepareParams, processResponse} from '../helpers'
import {request} from '../request'
{{#each definitionImports}}
import { {{~.~}} } from '../definitions'
{{/each}}

//------
// Call

export const {{call}}: {{name}}Operation = (params?: {{name}}Params) => {
  const {path, options} = serializeParameters({{quote path}}, prepareParams(params), paramsSerialization)
  return request({{quote method}}, path, options).then(processResponse) as Promise<{{name}}SuccessResponse | {{name}}ErrorResponse>
}

export type {{name}}Operation = SwaggerOperation<{{name}}Params, {{name}}SuccessResponse, {{name}}ErrorResponse>

//------
// Params

export interface {{name}}Params {
{{#each parameters}}
  {{name}}{{#if schema.optional}}?{{/if}}: {{schema.tsType}}
{{/each}}
}

const paramsSerialization: ParamsSerialization = {
{{#each paramsSerialization}}
  {{sanitizeKey @key}}: {{emit . inline=true}},
{{/each}}
}

//------
// Success responses

export type {{name}}SuccessResponse = {{#join successResponses separator=' | '}}{{name}}{{/join}}

{{#each successResponses}}
export interface {{name}} {
  status: {{status}}
{{#if schema}}
  body:   {{schema.tsType}}
{{/if}}
}
{{/each}}

//------
// Error responses

export type {{name}}ErrorResponse = {{#join errorResponses separator=' | '}}{{name}}{{/join}} | NoConnectionResponse

{{#each errorResponses}}
export interface {{name}} {
  status: {{status}}
  {{#if schema}}
  body:   {{schema.tsType}}
  {{/if}}
}
{{/each}}
