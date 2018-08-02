export interface SwaggerOperation<Params, Response, ErrorResponse> {
  (params: Params): Promise<Response | ErrorResponse>
}

export interface Response {
  status: number
  body:   any
  error?: Error
}

export interface RequestOptions {
  data?:    any
  query?:   any
  headers?: any
}