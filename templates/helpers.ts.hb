import {RequestInfo, ParamsSerialization, ParamSerialization, QueryString, Response} from './types'
import {request, RequestOptions} from './request'
{{#if keyCaseConversion}}
import {escapeRegExp, mapKeys, mapValues, isArray, isPlainObject, snakeCase, kebabCase, {{keyCaseConversion.lodashImport~}} } from 'lodash'
{{else}}
import {kebabCase, escapeRegExp} from 'lodash'
{{/if}}

export function performOperation(
  method: string,
  path: string,
  params: AnyObject | undefined,
  paramsSerialization: ParamsSerialization,
  options?: RequestOptions
) {
  const info = buildRequestInfo(method, path, params, paramsSerialization, options || {})
  return request(info).then(processResponse)
}

function buildRequestInfo(
  method: string,
  path: string,
  params: AnyObject | undefined,
  paramsSerialization: ParamsSerialization,
  options: RequestOptions
): RequestInfo {
  const info: RequestInfo = {
    method:  method,
    path:    path,
    url:     endpointURL(path),
    options: options,

    query:   [],
    data:    null,
    headers: {}
  }

  for (const [key, param] of Object.entries(params || {})) {
    const serialization = paramsSerialization[key]
    if (serialization == null) { continue }

    switch (serialization.in) {
    case 'query':
      serializeQueryParameter(info.query, serialization.name, param, serialization)
      break
    case 'header':
      info.headers[serialization.name] = serializeParameter(param, serialization)
      break
    case 'formData':
      info.data = []
      serializeQueryParameter(info.data, serialization.name, param, serialization)
      break
    case 'body':
      info.data = serializeParameter(param, serialization)
      break
    case 'path':
      info.path = interpolatePath(info.path, serialization.name, serializeParameter(param, serialization))
      break
    default:
      throw new Error(`Serialization type \`${serialization.in}\` not supported`)
    }
  }

  return info
}

const baseURL = {{emit description.baseURL}}

function endpointURL(path: string) {
  if (path.startsWith('/')) {
    return `${baseURL}${path}`
  } else {
    return `${baseURL}/${path}`
  }
}

function serializeQueryParameter(query: QueryString, name: string, value: string, serialization: ParamSerialization) {
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

function serializeParameter(parameter: any, serialization: ParamSerialization) {
{{#if keyCaseConversion}}
  if (serialization.in === 'body' && isPlainObject(parameter)) {
    return convertParameterKeyCase(parameter)
  }
{{/if}}
  return parameter
}

function interpolatePath(path: string, name: string, value: any) {
  const pattern = `\{${escapeRegExp(name)}\}`
  const regExp = new RegExp(pattern, 'g')

  return path.replace(regExp, value.toString())
}

function processResponse(response: Response): Response {
{{#if keyCaseConversion}}
  response = convertResponseKeyCase(response) as Response
{{/if}}
  return response
}

{{#if keyCaseConversion}}
function convertResponseKeyCase(obj: Record<string, any>): Record<string, any> {
  return mapKeysDeep(obj, (_, key) => {{keyCaseConversion.snippet}})
}

function convertParameterKeyCase(obj: any): Record<string, any> {
  if (!isPlainObject(obj)) { return obj }
  return mapKeysDeep(obj, (_, key) => snakeCase(key))
}

function mapKeysDeep(obj: any, cb: (value: any, key: string) => string): Record<string, any> {
  if (isArray(obj)) {
    return obj.map(i => mapKeysDeep(i, cb))
  } else if (isPlainObject(obj)) {
    return mapValues(
      mapKeys(obj, cb),
      val => mapKeysDeep(val, cb)
    )
  } else {
    return obj
  }
}
{{/if}}