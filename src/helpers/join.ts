import * as Handlebars from 'handlebars'
import {isArray} from 'lodash'

Handlebars.registerHelper('join', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(join(isArray(object) ? object : [object], opts.hash.separator))
})

export function join(arg: any[], separator: string) {
  return arg.map(a => a == null ? '' : a.toString()).join(separator)
}