import {RequestOptions} from './types'

export function buildRequestOptions(params?: AnyObject): RequestOptions {
  return {query: params}
}