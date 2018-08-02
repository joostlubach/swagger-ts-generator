import * as Handlebars from 'handlebars'
import {isArray, isPlainObject} from 'lodash'
import {sanitizeKey} from '.'

Handlebars.registerHelper('emit', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(emit(object, {indent: 0, ...opts.hash}))
})

export function emit(object: any, options: {indent: number}) {
  if (isArray(object)) {
    return emitArray(object, options)
  } else if (isPlainObject(object)) {
    return emitObject(object, options)
  } else {
    return JSON.stringify(object)
  }
}

export function emitArray(array: any[], options: {indent: number}) {
  const lines: string[] = []

  lines.push(`[`)
  for (const item of array) {
    lines.push(emit(item, {indent: options.indent + 1}))
  }
  lines.push(`${indent(options.indent)}]`)

  return lines.join('\n')
}

export function emitObject(object: AnyObject, options: {indent: number}) {
  const lines: string[] = []

  lines.push(`{`)
  for (const [key, value] of Object.entries(object)) {
    lines.push(`${indent(options.indent + 1)}${sanitizeKey(key)}: ${emit(value, {indent: options.indent + 1})},`)
  }
  lines.push(`${indent(options.indent)}}`)

  return lines.join('\n')
}

function indent(level: number) {
  return Array(level + 1).join('  ')
}