{{#each definitionImports}}
import { {{~.~}} } from './{{.}}'
{{/each}}
{{#if definitionImports}}

{{/if}}
{{#if isObject}}
export interface {{name}} {
  {{#if schema.additionalProperties}}
    [key: string]: {{schema.additionalProperties.tsType}}{{#if schema.additionalProperties.x-nullable}} | null{{/if}}
  {{/if}}
  {{#each schema.properties}}
    {{sanitizeKey name}}: {{schema.tsType}}{{#if schema.x-nullable}} | null{{/if}}
  {{/each}}
}
{{else}}
export type {{name}} = {{schema.tsType}}
{{/if}}