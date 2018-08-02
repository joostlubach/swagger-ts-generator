import {SwaggerOperation} from '../types'
import {Response, ParamsSerialization} from '../types'
import {serializeParameters} from '../helpers'
import {request} from '../request'
{{#each definitionImports}}
import { {{~.~}} } from '../definitions'
{{/each}}

//------
// Call

export const {{call}}: {{name}} = (params?: {{name}}Params) => {
  return request({{quote method}}, {{quote path}}, serializeParameters(params, paramsSerialization))
}

export type {{name}} = SwaggerOperation<{{name}}Params, {{name}}SuccessResponse, {{name}}ErrorResponse>

//------
// Params

export interface {{name}}Params {
{{#each parameters}}
  {{name}}{{#if schema.optional}}?{{/if}}: {{schema.tsType}}
{{/each}}
}

export const paramsSerialization: ParamsSerialization = {
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
  body:   {{schema.tsType}}
}
{{/each}}

//------
// Error responses

export type {{name}}ErrorResponse = {{#join errorResponses separator=' | '}}{{name}}{{/join}} | Response

{{#each errorResponses}}
export interface {{name}} {
  status: {{status}}
  {{#if schema}}
  body:   {{schema.tsType}}
  {{/if}}
}
{{/each}}
