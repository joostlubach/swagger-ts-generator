import {SwaggerOperation} from '../types'
import {NoConnectionResponse, ParamsSerialization, Binary} from '../types'
import {performOperation} from '../helpers'
import {RequestOptions} from '../request'
{{#each definitionImports}}
import { {{~.~}} } from '../definitions'
{{/each}}

//------
// Call

export const {{call}}: {{name}}Operation = (params?: {{name}}Params, options?: RequestOptions) => {
  return performOperation(
    {{quote method}},
    {{quote path}},
    params,
    paramsSerialization
  ) as Promise<{{name}}SuccessResponse | {{name}}ErrorResponse>
}

export type {{name}}Operation = SwaggerOperation<{{name}}Params, {{name}}SuccessResponse, {{name}}ErrorResponse>

//------
// Params

export interface {{name}}Params {
{{#each parameters}}
  {{safeName}}{{#if schema.optional}}?{{/if}}: {{tsType}}
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
