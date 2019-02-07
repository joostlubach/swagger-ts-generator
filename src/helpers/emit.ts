import * as Handlebars from 'handlebars'
import {isArray, isPlainObject} from 'lodash'
import {sanitizeKey} from '.'
import {quote} from './quote'

export interface Options {
  indent?:        number
  emitUndefined?: boolean
  inline?:        boolean
}

Handlebars.registerHelper('emit', function (object: any, opts: Handlebars.HelperOptions) {
  return new Handlebars.SafeString(emit(object, {indent: 0, ...opts.hash}))
})

export function emit(object: any, options: Options = {}) {
  if (isArray(object)) {
    return emitArray(object, options)
  } else if (isPlainObject(object)) {
    return emitObject(object, options)
  } else if (typeof object === 'string') {
    return quote(object)
  } else {
    return JSON.stringify(object)
  }
}

export function emitArray(array: any[], options: Options = {}) {
  const lines: string[] = []

  lines.push(`[`)
  for (const item of array) {
    lines.push(emit(item, {indent: (options.indent || 0) + 1}))
  }
  lines.push(`${indent(options)}]`)

  return lines.join(options.inline ? '' : '\n')
}

export function emitObject(object: AnyObject, options: Options) {
  const lines: string[] = []

  lines.push(`{`)
  for (const [key, value] of Object.entries(object)) {
    if (value === undefined && !options.emitUndefined) { continue }

    const childOptions = {
      ...options,
      indent: (options.indent || 0) + 1
    }
    lines.push(`${indent(childOptions)}${sanitizeKey(key)}: ${emit(value, childOptions)}, `)
  }
  if (lines.length) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -2)
  }
  lines.push(`${indent(options)}}`)

  return lines.join(options.inline ? '' : '\n')
}

function indent(options: Options) {
  if (options.inline) { return '' }
  return Array((options.indent || 0) + 1).join('  ')
}