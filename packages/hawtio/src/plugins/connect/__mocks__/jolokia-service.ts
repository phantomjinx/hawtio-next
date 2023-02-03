import { ISimpleOptions } from 'jolokia.js'
import jmxCamelResponse from './jmx-camel-tree.json'
import fs from 'fs'
import path from 'path'

const routesXmlPath = path.resolve(__dirname, 'camel-sample-app-routes.xml');

const camelSampleAppRoutesXml = fs.readFileSync(routesXmlPath, {encoding:'utf8', flag:'r'});

class MockJolokiaService {
  constructor() {
    console.log('Using mock jolokia service')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async list(options: ISimpleOptions): Promise<unknown> {
    return new Promise<unknown>((resolve) => {
      resolve(jmxCamelResponse)
    })
  }

  async execute(mbean: string, operation: string, args: unknown[] = []): Promise<unknown> {
    if (mbean === 'org.apache.camel:context=SampleCamel,type=context,name=\"SampleCamel\"' && operation === 'dumpRoutesAsXml()') {
      return new Promise((resolve, reject) => {
        resolve(camelSampleAppRoutesXml)
      })
    }

    return new Promise((resolve, reject) => {
      resolve('')
    })
  }
}

export const jolokiaService = new MockJolokiaService()
