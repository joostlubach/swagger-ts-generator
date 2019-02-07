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
  const info = buildRequestInfo(method, path, prepareParams(params), paramsSerialization, options || {})
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
    options: options,

    query:   [],
    data:    null,
    headers: {}
  }

  for (const [name, param] of Object.entries(params || {})) {
    const serialization = paramsSerialization[name]
    if (serialization == null) { continue }

    switch (serialization.in) {
    case 'query':
      serializeQueryParameter(info.query, name, param, serialization)
      break
    case 'header':
      info.headers[name] = serializeParameter(param, serialization)
      break
    case 'formData':
      info.data = []
      serializeQueryParameter(info.data, name, param, serialization)
      break
    case 'body':
      info.data = serializeParameter(param, serialization)
      break
    case 'path':
      info.path = interpolatePath(info.path, name, serializeParameter(param, serialization))
      break
    default:
      throw new Error(`Serialization type \`${serialization.in}\` not supported`)
    }
  }

  return info
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
  return parameter
}

function interpolatePath(path: string, name: string, value: any) {
  const pattern = `\{${escapeRegExp(name)}\}`
  const regExp = new RegExp(pattern, 'g')

  return path.replace(regExp, value.toString())
}

function prepareParams(params?: AnyObject): AnyObject | undefined {
  if (params == null) { return }

{{#if keyCaseConversion}}
  params = convertParamsKeyCase(params)
{{/if}}

  return params
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

function convertParamsKeyCase(obj: Record<string, any>): Record<string, any> {
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