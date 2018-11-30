import * as Handlebars from 'handlebars'
import {quote} from './quote'
import options, {Casing} from '../CommandLineOptions'
import {camelCase, upperFirst, kebabCase, snakeCase} from 'lodash'

Handlebars.registerHelper('sanitizeKey', function (key: string, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(sanitizeKey(key))
})

export function sanitizeKey(key: any) {
  if (typeof key !== 'string') {
    return `[${JSON.stringify(key)}]`
  }

  key = caseKey(key)

  if (/[^_a-zA-Z]/.test(key)) {
    return quote(key)
  }

  return key
}

export function caseKey(key: string) {
  if (options.casing == null) { return key }

  switch (options.casing) {
  case Casing.kebab: return kebabCase(key)
  case Casing.snake: return snakeCase(key)
  case Casing.camel: return camelCase(key)
  case Casing.pascal: return upperFirst(camelCase(key))
  }  
}