import * as Handlebars from 'handlebars'
import {isArray} from 'lodash'

Handlebars.registerHelper('join', function (object: any, opts: Handlebars.HelperOptions) {
  let arr = isArray(object) ? object : [object]
  if (opts.fn) { arr = arr.map(i => opts.fn(i, opts)) }

  return new Handlebars.SafeString(join(arr, opts.hash.separator))
})

export function join(arg: any[], separator: string) {
  return arg.map(a => a == null ? '' : a.toString()).join(separator)
}