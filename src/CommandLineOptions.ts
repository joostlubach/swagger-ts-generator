import * as minimist from 'minimist'
import {isArray} from 'lodash'

export enum Casing {
  snake,
  kebab,
  camel,
  pascal
}

const Invalid = {}
type Invalid = typeof Invalid

class CommandLineOptions {

  constructor(public readonly opts: minimist.ParsedArgs) {
    if (this.opts._.length >= 2) {
      this.jsonFile = this.opts._[0]
      this.outDir   = this.opts._[1]
    } else {
      this.jsonFile = null
      this.outDir = this.opts._[0]
    }

    this.defaultedParameters = wrapArrayOption(this.opts['defaulted'])
    this.casing = parseCasing(this.opts['casing']) as Casing
  }

  public static parse(argv: string[]) {
    const opts = minimist(argv)
    return new CommandLineOptions(opts)
  }

  public readonly jsonFile: string | null
  public readonly outDir:   string

  public readonly casing?: Casing
  public readonly defaultedParameters: string[]

  get valid() {
    if (this.outDir == null) { return false }
    if (this.casing === Invalid) { return false }

    return true
  }

}

function parseCasing(casing?: string) {
  if (casing == null) { return undefined }

  if (!Object.keys(Casing).includes(casing)) {
    return Invalid
  }
  return (Casing as any)[casing] as Casing
}

function wrapArrayOption(arg: string | string[] | undefined | null): string[] {
  if (arg == null) { return [] }
  return isArray(arg) ? arg : [arg]
}

export default CommandLineOptions.parse(process.argv.slice(2))