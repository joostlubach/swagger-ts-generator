import ApiDescription, { Operation } from './ApiDescription'
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

    await this.emitInfo(description)
    // await this.emitDefinitions(description)
    await this.emitOperations(description)
  }

  public async emitInfo(description: ApiDescription) {
    this.logger.log(chalk`{blue ⇢} Emitting API info`)
    this.emitTemplate('info', 'info.ts', {info: description.info})
  }

  public async emitOperations(description: ApiDescription) {
    for (const [path, entry] of Object.entries(description.paths)) {
      for (const [method, operation] of Object.entries(entry)) {
        await this.emitOperation(method, path, operation)
      }
    }
  }

  public async emitOperation(method: string, path: string, operation: Operation) {
    this.logger.log(chalk`{blue ⇢} Emitting operation {yellow ${method.toUpperCase()} ${path}}`)

    const operationId = operation.operationId || `${method.toLowerCase()}_${camelCase(path)}`
    this.emitTemplate('operation', `operations/${operationId}`, operation)
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
    return Handlebars.compile(content)
  }

}