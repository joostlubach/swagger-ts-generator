import {ApiDescription, Operation, Definition} from './swagger'
import Logger from './Logger'
import chalk from 'chalk'
import * as Path from 'path'
import * as FS from 'fs-extra'
import * as Handlebars from 'handlebars'
import './helpers'
import {camelCase} from 'lodash'

export interface Options {
  jsonFile: string
  outDir:   string
}

export default class Generator {

  constructor(public readonly options: Options) {}

  public logger = new Logger()

  public async generate() {
    const description = await ApiDescription.load(this.options.jsonFile)
    this.logger.log(chalk`{green ⇢} Loaded API description {yellow ${JSON.stringify(description.info.title)}}`)

    await this.emitSkeleton()
    await this.emitRequestHelper()
    await this.emitInfo(description)
    await this.emitDefinitions(description)
    await this.emitOperations(description)
  }

  public async emitSkeleton() {
    this.logger.log(chalk`{blue ⇢} Emitting skeleton structure`)
    await this.emitTemplate('index', 'index.ts', {
      index: [
        {export: '*', from: './operations'},
        {export: '*', from: './definitions'},
      ]
    })
    await this.emitTemplate('types', 'types.ts', {})
    await this.emitTemplate('helpers', 'helpers.ts', {})
  }

  public async emitRequestHelper() {
    if (await FS.pathExists(this.outPath('request.ts'))) {
      this.logger.log(chalk`{yellow ⇢} Skipping generation of request helper`)
    } else {
      this.logger.log(chalk`{blue ⇢} Emitting request helper`)
      await this.emitTemplate('request', 'request.ts', {})
    }
  }

  public async emitInfo(description: ApiDescription) {
    this.logger.log(chalk`{blue ⇢} Emitting API info`)
    await this.emitTemplate('info', 'info.ts', {info: description.info})
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

    await this.emitTemplate('operation', `operations/${operation.call}.ts`, operation)
  }


  private async emitTemplate(name: string, path: string, data: AnyObject) {
    const template = await this.loadTemplate(name)
    const content = template(data)
    const outPath = this.outPath(path)
    await FS.writeFile(outPath, content)    
  }

  //------
  // Paths

  private outPath(path: string) {
    return Path.resolve(this.options.outDir, path)
  }

  //------
  // Templates

  private async loadTemplate(name: string) {
    const filename = Path.resolve(__dirname, `../templates/${name}.ts.hb`)
    const content = await FS.readFile(filename, 'utf-8')
    return Handlebars.compile(content, {noEscape: true})
  }

}