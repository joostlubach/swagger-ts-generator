import {RequestOptions, ParamsSerialization, ParamSerialization, QueryString, Response} from './types'
{{#if keyCaseConversion}}
import {escapeRegExp, mapKeys, mapValues, isPlainObject, {{keyCaseConversion.lodashImport~}} } from 'lodash'
{{else}}
import {escapeRegExp} from 'lodash'
{{/if}}

interface Result {
  path:    string
  options: RequestOptions
}

export function serializeParameters(path: string, params: AnyObject | undefined, paramsSerialization: ParamsSerialization): Result {
  const options: RequestOptions = {
    query:   [],
    data:    null,
    headers: {}
  }

  for (const [name, param] of Object.entries(params || {})) {
    const serialization = paramsSerialization[name]
    if (serialization == null) { continue }

    switch (serialization.in) {
    case 'query':
      serializeQueryParameter(options.query, name, param, serialization)
      break
    case 'header':
      options.headers[name] = serializeParameter(param, serialization)
      break
    case 'formData':
      options.data = []
      serializeQueryParameter(options.data, name, param, serialization)
      break
    case 'body':
      options.data = serializeParameter(param, serialization)
      break
    case 'path':
      path = interpolatePath(path, name, serializeParameter(param, serialization))
      break
    default:
      throw new Error(`Serialization type \`${serialization.in}\` not supported`)
    }
  }

  return {path, options}
}

export function serializeQueryParameter(query: QueryString, name: string, value: string, serialization: ParamSerialization) {
  if (!Array.isArray(value)) {
    query.push({name, value})
    return
  }

  switch (serialization.collectionFormat) {
  case 'csv': 
    query.push({name, value: value.join(',')})
    break
  case 'ssv': 
    query.push({name, value: value.join(' ')})
    break
  case 'tsv': 
    query.push({name, value: value.join('\t')})
    break
  case 'pipes':
    query.push({name, value: value.join('|')})
    break
  case 'multi':
    value.forEach(value => query.push({name, value}))
  }
}

export function serializeParameter(parameter: any, serialization: ParamSerialization) {
  return parameter
}

export function interpolatePath(path: string, name: string, value: any) {
  const pattern = `\{${escapeRegExp(name)}\}`
  const regExp = new RegExp(pattern, 'g')

  return path.replace(regExp, value.toString())
}

export function processResponse(response: Response): Response {
{{#if keyCaseConversion}}
  response = convertKeyCase(response) as Response
{{/if}}
  return response
}

{{#if keyCaseConversion}}
function convertKeyCase(obj: Record<string, any>): Record<string, any> {
  return mapKeysDeep(obj, (_, key) => {{keyCaseConversion.snippet}})
}

function mapKeysDeep(obj: Record<string, any>, cb: (value: any, key: string) => string): Record<string, any> {
  return mapValues(
    mapKeys(obj, cb),
    val => isPlainObject(val) ? mapKeysDeep(val, cb) : val
  )
}
{{/if}}