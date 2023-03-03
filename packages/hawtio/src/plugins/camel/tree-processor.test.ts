import { jolokiaService } from '@hawtiosrc/plugins/connect/jolokia-service'
import { MBeanNode, MBeanTree, workspace } from '@hawtiosrc/plugins/shared'
import { camelContexts, componentsType, contextNodeType, contextsType, endpointsType, jmxDomain, routesType } from './globals'
import * as ccs from './camel-content-service'
import * as tp from './tree-processor'
import fs from 'fs'
import path from 'path'

jest.mock('@hawtiosrc/plugins/connect/jolokia-service')

const CAMEL_MODEL_VERSION = '3.20.2'

describe('tree-processor', () => {

  let tree: MBeanTree

  const routesXmlPath = path.resolve(__dirname, 'testdata', 'camel-sample-app-routes.xml')
  const sampleRoutesXml = fs.readFileSync(routesXmlPath, { encoding: 'utf8', flag: 'r' })

  jolokiaService.execute = jest.fn(async (mbean: string, operation: string, args?: unknown[]): Promise<unknown> => {
    if (
      mbean === 'org.apache.camel:context=SampleCamel,type=context,name="SampleCamel"' &&
      operation === 'dumpRoutesAsXml()'
    ) {
      return sampleRoutesXml
    }

    return ''
  })

  jolokiaService.readAttribute = jest.fn(async (mbean: string, attribute: string): Promise<unknown> => {
    if (
      mbean === 'org.apache.camel:context=SampleCamel,type=context,name="SampleCamel"' &&
      attribute === 'CamelVersion'
    ) {
      return CAMEL_MODEL_VERSION
    }

    return ''
  })

  beforeAll(async () => {
    tree = await workspace.getTree()
  })

  test('processTreeDomain', (done) => {
    expect(tree.isEmpty()).toBeFalsy()

    const domainNode: MBeanNode = tree.get(jmxDomain) as MBeanNode
    expect(tree.get(jmxDomain)).toBeDefined()

    tp.processTreeDomain(domainNode as MBeanNode)

    /* Force a delay to allow the camel version to be retrieved */
    setTimeout(() => {
      expect(domainNode.childCount()).toBe(1)

      const contextsNode: MBeanNode = domainNode.getIndex(0) as MBeanNode
      expect(contextsNode).not.toBeNull()
      expect(ccs.hasDomain(contextsNode)).toBeTruthy()
      expect(ccs.hasType(contextsNode, contextsType)).toBeTruthy()
      expect(contextsNode.id).toBe(`${camelContexts}-1`)
      expect(contextsNode.name).toBe(camelContexts)
      expect(contextsNode.childCount()).toBe(1)

      const contextNode: MBeanNode = contextsNode.getIndex(0) as MBeanNode
      expect(ccs.hasDomain(contextNode)).toBeTruthy()
      expect(ccs.hasType(contextNode, contextNodeType)).toBeTruthy()
      expect(contextNode.id).toBe('SampleCamel-1')
      expect(contextNode.name).toBe('SampleCamel')
      expect(ccs.getCamelVersion(contextNode)).toBe(CAMEL_MODEL_VERSION)
      expect(contextNode.childCount()).toBe(4)

      // routesType, endpointsType, componentsType, mbeansType]) {

      const routesNode = contextNode.get(routesType) as MBeanNode
      expect(routesNode).toBeDefined()
      expect(ccs.hasDomain(routesNode)).toBeTruthy()
      expect(ccs.hasType(routesNode, routesType)).toBeTruthy()
      expect(routesNode.id).toMatch(new RegExp(`^${routesType}-[0-9]+`))
      expect(routesNode.name).toBe(routesType)
      expect(ccs.getCamelVersion(routesNode)).toBe(CAMEL_MODEL_VERSION)
      expect(routesNode.childCount()).toBe(2)

      done()
    }, 2000)
  })
})
