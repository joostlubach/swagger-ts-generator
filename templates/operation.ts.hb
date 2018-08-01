import {SwaggerOperation} from '../../types'
import {Response} from '../../types'
import {request} from '../../helpers'
{{#each definitionImports}}
import {{{name}}} from '../../definitions'
{{/each}}

//------
// Call

export const {{camel name}}: {{pascal name}} = (params?: {{pascal name}}Params) => {
  return request({{quote method}}, {{quote path}}, {query: params})
}

export type {{pascal name}} = SwaggerOperation<{{pascal name}}Params, {{pascal name}}Response, {{pascal name}}ErrorResponse>

//------
// Params

export interface {{pascal name}}Params {
{{#each parameters}}
  {{name}}?: {{type}}
{{/each}}
}

//------
// Response

export type {{pascal name}}Response = {{#join responses separator=' | '}}{{name}}{{/join}}

{{#each responses}}
export interface {{name}} {
  status: {{status}}
  body:   {{bodyType}}
}
{{/each}}

//------
// ErrorResponse

export type {{pascal name}}ErrorResponse = {{#join errorResponses separator=' | '}}{{name}}{{/join}}

{{#each errorResponses}}
export interface {{name}} {
  status: {{status}}
  {{#if bodyType}}
  body:   {{bodyType}}
  {{/if}}
}
{{/each}}
