import * as minimist from 'minimist'

const argv = minimist(process.argv)

export default class CommandLineOptions {

  constructor(private readonly args: minimist.ParsedArgs) {
    this.jsonFile = args._[0]
    this.outDir   = args._[1]
  }

  public static parse(argv: string[]) {
    const opts = minimist(argv)
    return new CommandLineOptions(opts)
  }

  public readonly jsonFile: string
  public readonly outDir:   string

  get valid() {
    if (this.jsonFile == null) { return false }
    if (this.outDir == null) { return false }

    return true
  }

}