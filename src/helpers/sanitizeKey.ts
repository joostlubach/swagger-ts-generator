import * as Handlebars from 'handlebars'
import {quote} from './quote'

Handlebars.registerHelper('sanitizeKey', function (key: string, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(sanitizeKey(key))
})

export function sanitizeKey(key: any) {
  if (typeof key !== 'string') {
    return `[${JSON.stringify(key)}]`
  }

  if (/[^a-zA-Z]/.test(key)) {
    return quote(key)
  }

  return key
}
