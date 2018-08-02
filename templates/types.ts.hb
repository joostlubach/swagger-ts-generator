export interface SwaggerOperation<Params, Response, ErrorResponse> {
  (params: Params): Promise<Response | ErrorResponse>
}

export interface Response {
  status: number
  body:   any
  error?: Error
}

export interface RequestOptions {
  query:   QueryString
  data:    any
  headers: Record<string, any>
}

export interface ParamsSerialization {
  [name: string]: ParamSerialization
}

export interface ParamSerialization {
  in: 'query' | 'header' | 'path' | 'formData' | 'body'
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi'
}

export type QueryString = Array<{name: string, value: any}>