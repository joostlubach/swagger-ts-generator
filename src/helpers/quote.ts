import * as Handlebars from 'handlebars'
import {camelCase, upperFirst} from 'lodash'

Handlebars.registerHelper('quote', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(quote(object == null ? '' : object.toString()))
})

export function quote(arg: string) {
  return `'${arg.replace('\'', '\\\'')}'`
}