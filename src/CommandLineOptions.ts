import * as minimist from 'minimist'
import {isArray} from 'lodash'

export default class CommandLineOptions {

  constructor(public readonly opts: minimist.ParsedArgs) {
    this.jsonFile = this.opts._[0]
    this.outDir   = this.opts._[1]

    this.defaultedParameters = wrapArrayOption(this.opts['defaulted'])
  }

  public static parse(argv: string[]) {
    const opts = minimist(argv)
    return new CommandLineOptions(opts)
  }

  public readonly jsonFile: string
  public readonly outDir:   string

  public readonly defaultedParameters: string[]

  get valid() {
    if (this.jsonFile == null) { return false }
    if (this.outDir == null) { return false }

    return true
  }

}

function wrapArrayOption(arg: string | string[] | undefined | null): string[] {
  if (arg == null) { return [] }
  return isArray(arg) ? arg : [arg]
}