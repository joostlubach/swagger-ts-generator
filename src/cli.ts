import options from './CommandLineOptions'
import Generator from './Generator'
import chalk from 'chalk'

const usage = chalk`
{bold USAGE}
\tstsgen [-c <casing>] [--defaulted]
\t       {bold [<json-file|url-to-json-file>]}
\t       {bold <out-dir>}

Generates TypeScript definitions from a Swagger (Open API) JSON file. Specify either a filename or a URL to
a JSON resource. If omitted, JSON is read from {bold stdin}.

{bold OPTIONS}
\t-c <casing>, --casing=<casing>
\t\tSpecify a case conversion for object keys. Allowed values: {yellow snake}, {yellow kebab}, {yellow camel}, {yellow pascal}.
\t\tIf omitted, keys are not converted.
\t--defaulted=<patterns>
\t\tSpecify a list of parameters that are defaulted (wildcards permitted). These parameters are marked as optional
\t\tin operation param objects. It is expected that your client code provides values for these parameters.
\t\tUse the name of the operation for the full parameter names, e.g. a parameter 'ids' in an operation 'getAccounts'
\t\tshould be specified as 'getAccounts.ids'. For an overall parameter, use a wildcard. E.g. to specify that you
\t\tprovide a default for the 'Authorization' parameter, use '*.Authorization'.
`

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

const generator = new Generator()
generator.generate()