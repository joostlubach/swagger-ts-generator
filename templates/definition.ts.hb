{{#each definitionImports}}
import { {{~.~}} } from './{{.}}'
{{/each}}
{{#if definitionImports}}

{{/if}}
{{#if isObject}}
export interface {{name}} {
  {{#each schema.properties}}
    {{sanitizeKey name}}: {{schema.tsType}}{{#if schema.x-nullable}} | null{{/if}}
  {{/each}}
}
{{else}}
export type {{name}} = {{schema.tsType}}
{{/if}}