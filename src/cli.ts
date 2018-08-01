import CommandLineOptions from './CommandLineOptions'
import Generator from './Generator'
import chalk from 'chalk'

const usage = chalk`
Usage: stsgen {bold <json-file>} {bold <out-dir>}
`
const options = CommandLineOptions.parse(process.argv.slice(2))
if (!options.valid) {
  process.stderr.write(usage)
  process.exit(99)
}

process.on('unhandledRejection', (error: Error) => {
  process.stderr.write(chalk`{red ${error.message}}\n`)
  if (error.stack) {
    process.stderr.write(chalk`{dim ${error.stack.split('\n').slice(1).join('\n')}}\n`)
  }
  process.exit(1)
})

const generator = new Generator(options)
generator.generate()