import {RequestOptions} from './request'

export type SwaggerOperation<Params, Response, ErrorResponse> =
  (params: Params, options?: RequestOptions) => Promise<Response | ErrorResponse>

export interface Response {
  status: number
  body:   any
  error?: Error
}

export interface NoConnectionResponse {
  status: 0
}

export interface RequestInfo {
  method:  string
  path:    string
  url:     string
  options: RequestOptions
  
  query:   QueryString
  data:    any
  headers: Record<string, any>
}

export interface ParamsSerialization {
  [name: string]: ParamSerialization
}

export interface ParamSerialization {
  name: string
  in: 'query' | 'header' | 'path' | 'formData' | 'body'
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi'
}

export type QueryString = Array<{name: string, value: any}>

export type Binary = Blob | Uint8Array