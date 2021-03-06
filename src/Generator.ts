import {ApiDescription, Operation, Parameter, Definition} from './swagger'
import Logger from './Logger'
import chalk from 'chalk'
import * as Path from 'path'
import * as FS from 'fs-extra'
import * as Handlebars from 'handlebars'
import './helpers'
import {createMatcher} from './util'
import options, {Casing} from './CommandLineOptions'

export default class Generator {

  public logger = new Logger()

  public async generate() {
    const description = await ApiDescription.load(options.jsonFile)
    this.logger.log(chalk`{green ⇢} Loaded API description {yellow ${JSON.stringify(description.info.title)}}`)

    await this.emitSkeleton()
    await this.emitRequestHelper()
    await this.emitHelpers(description)
    await this.emitInfo(description)
    await this.emitDefinitions(description)
    await this.emitOperations(description)
  }

  public async emitSkeleton() {
    this.logger.log(chalk`{blue ⇢} Emitting skeleton structure`)

    await this.emptyDir('definitions')
    await this.emptyDir('operations')

    await this.emitTemplate('index', 'index.ts', {
      index: [
        {export: '*', from: './operations'},
        {export: '*', from: './definitions'},
      ]
    })
    await this.emitTemplate('types', 'types.ts', {})
  }

  public async emitRequestHelper() {
    if (await FS.pathExists(this.outPath('request.ts'))) {
      this.logger.log(chalk`{yellow ⇢} Skipping generation of request helper`)
    } else {
      this.logger.log(chalk`{blue ⇢} Emitting request helper`)
      await this.emitTemplate('request', 'request.ts', {})
    }
  }

  public async emitHelpers(description: ApiDescription) {
    await this.emitTemplate('helpers', 'helpers.ts', {
      description,
      keyCaseConversion: options.casing && KEY_CASE_CONVERSIONS[options.casing]
    })
  }

  public async emitInfo(description: ApiDescription) {
    this.logger.log(chalk`{blue ⇢} Emitting API info`)
    await this.emitTemplate('info', 'info.ts', description)
  }

  public async emitDefinitions(description: ApiDescription) {
    for (const definition of description.definitions) {
      await this.emitDefinition(definition)
    }

    await this.emitTemplate('index', 'definitions/index.ts', {
      index: description.definitions.map(d => ({export: '*', from: `./${d.name}`}))
    })
  }

  public async emitDefinition(definition: Definition) {
    const {name} = definition
    this.logger.log(chalk`{blue ⇢} Emitting definition {yellow ${name}}`)

    await this.emitTemplate('definition', `definitions/${name}.ts`, definition)
  }

  public async emitOperations(description: ApiDescription) {
    for (const operation of description.operations) {
      await this.emitOperation(operation)
    }

    await this.emitTemplate('index', 'operations/index.ts', {
      index: description.operations.map(d => ({export: '*', from: `./${d.call}`}))
    })
  }

  public async emitOperation(operation: Operation) {
    const {method, path} = operation
    this.logger.log(chalk`{blue ⇢} Emitting operation {yellow ${method.toUpperCase()} ${path}}`)

    const context = this.createOperationContext(operation)
    await this.emitTemplate('operation', `operations/${operation.call}.ts`, context)
  }

  private createOperationContext(operation: Operation): AnyObject {
    if (!this.hasDefaultedParameters) { return operation }

    return new Proxy(operation, {
      get: (operation: Operation, key: PropertyKey) => {
        switch (key) {
        case 'parameters':
          return this.markDefaultedParameters(operation, operation.parameters)
        default:
          return (operation as any)[key]
        }
      }
    })
  }

  private markDefaultedParameters(operation: Operation, parameters: Parameter[]) {
    return parameters.map(param => {
      const qualifiedName = `${operation.name}.${param.name}`
      if (this.isDefaultedParameter(qualifiedName)) {
        return param.copy({required: false})
      } else {
        return param
      }
    })
  }

  private async emptyDir(path: string) {
    const outPath = this.outPath(path)
    await FS.emptyDir(outPath)
  }

  private async emitTemplate(name: string, path: string, data: AnyObject) {
    const template = await this.loadTemplate(name)
    const content = template(data)
    const outPath = this.outPath(path)
    await FS.ensureDir(Path.dirname(outPath))
    await FS.writeFile(outPath, content)    
  }

  //------
  // Paths

  private outPath(path: string) {
    return Path.resolve(options.outDir, path)
  }

  //------
  // Templates

  private async loadTemplate(name: string) {
    const filename = Path.resolve(__dirname, `../templates/${name}.ts.hb`)
    const content = await FS.readFile(filename, 'utf-8')
    return Handlebars.compile(content, {noEscape: true})
  }


  //------
  // Defaulted paramaters

  private defaultedParameterMatcher = createMatcher(options.defaultedParameters)

  private get hasDefaultedParameters() {
    return this.defaultedParameterMatcher != null
  }

  private isDefaultedParameter(qualifiedName: string) {
    if (this.defaultedParameterMatcher == null) { return false }
    return this.defaultedParameterMatcher.test(qualifiedName)
  }

}

const KEY_CASE_CONVERSIONS: Record<Casing, AnyObject> = {
  [Casing.kebab]:  {lodashImport: 'kebabCase', snippet: 'kebabCase(key)'},
  [Casing.snake]:  {lodashImport: '', snippet: 'snakeCase(key)'},
  [Casing.camel]:  {lodashImport: 'camelCase', snippet: 'camelCase(key)'},
  [Casing.pascal]: {lodashImport: 'camelCase, upperFirst', snippet: 'upperFirst(camelCase(key))'},
}