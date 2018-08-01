import * as Handlebars from 'handlebars'
import {camelCase, upperFirst} from 'lodash'

Handlebars.registerHelper('camel', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(camel(object == null ? '' : object.toString()))
})

Handlebars.registerHelper('pascal', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(pascal(object == null ? '' : object.toString()))
})

export function camel(arg: string) {
  return camelCase(arg)
}

export function pascal(arg: string) {
  return upperFirst(camelCase(arg))
}