import {escapeRegExp} from 'lodash'

export function createMatcher(patterns: string[] | null | undefined): RegExp | null {
  if (patterns == null) { return null }

  const pattern = patterns.map(pattern => escapeRegExp(pattern))
    .map(p => p.replace(/\\\*/g, '.*'))
    .join('|')

  return new RegExp(pattern)
}