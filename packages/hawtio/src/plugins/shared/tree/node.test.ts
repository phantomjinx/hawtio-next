import { workspace } from '../workspace'
import { MBeanNode } from './node'
import { MBeanTree } from './tree'

jest.mock('@hawtiosrc/plugins/connect/jolokia-service')

describe('tree', () => {
  let tree: MBeanTree

  beforeEach(async () => {
    tree = await workspace.getTree()
    workspace.refreshTree()
  })

  test('removeChildren', async () => {
    const nodes = tree.getTree()
    expect(nodes.length).toBeGreaterThan(0)

    const camel = tree.get('org.apache.camel') as MBeanNode
    const count = camel.childCount()
    const orphans = camel.removeChildren()
    expect(orphans.length).toEqual(count)
    expect(camel.childCount()).toEqual(0)
    for (let o of orphans) {
      expect(o.parent).toBeNull()
    }
  })

  test('checking the tree nodes fullpaths', async () => {
    const nodes = tree.getTree()
    expect(nodes.length).toBeGreaterThan(0)

    const logging = tree.get('java.util.logging') as MBeanNode
    expect(logging).not.toBeNull()
    expect(logging.parent).toBeNull()

    const camel = tree.get('org.apache.camel') as MBeanNode
    expect(camel).not.toBeNull()
    expect(camel.parent).toBeNull()
    const sc = camel.get('SampleCamel') as MBeanNode
    expect(sc).not.toBeNull()
    expect(sc.parent).toBe(camel)
    const comp = sc.get('components') as MBeanNode
    expect(comp).not.toBeNull()
    expect(comp.parent).toBe(sc)
  })

  test('findAncestors', async () => {
    const camelNode = tree.get('org.apache.camel') as MBeanNode
    expect(camelNode).not.toBeNull()
    expect(camelNode.id).toBe('org-apache-camel')

    const ctxNode = camelNode.getIndex(0) as MBeanNode
    expect(ctxNode).not.toBeNull()
    expect(ctxNode.id).toBe('SampleCamel-1')
    expect(ctxNode.name).toBe('SampleCamel')

    const compNode = ctxNode.get('components') as MBeanNode
    expect(compNode).not.toBeNull()
    expect(compNode.id).toBe('components-4')

    const chain: string[] = [camelNode.name, ctxNode.name]
    expect(compNode.findAncestors().map((n: MBeanNode) => n.name)).toEqual(chain)
  })

  test('findAncestor', async () => {
    const tree: MBeanTree = await workspace.getTree()
    const camelNode = tree.get('org.apache.camel') as MBeanNode
    expect(camelNode).not.toBeNull()
    expect(camelNode.id).toBe('org-apache-camel')

    const ctxNode = camelNode.getIndex(0) as MBeanNode
    expect(ctxNode).not.toBeNull()
    expect(ctxNode.id).toBe('SampleCamel-1')
    expect(ctxNode.name).toBe('SampleCamel')

    const compNode = ctxNode.get('components') as MBeanNode
    expect(compNode).not.toBeNull()
    expect(compNode.id).toBe('components-4')

    expect(compNode.findAncestor((node: MBeanNode) => node.name === ctxNode.name)).toBe(ctxNode)
    expect(compNode.findAncestor((node: MBeanNode) => node.name === camelNode.name)).toBe(camelNode)
  })
})
