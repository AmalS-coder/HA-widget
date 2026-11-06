import type { HaDashboard, HaPair } from './haPair.types.ts'

export const mockScenarios = ['updating', 'no-volume', 'rebooting', 'traffic-b', 'offline', 'clusters'] as const
export type MockScenario = typeof mockScenarios[number]

const basePair: HaPair = {
  id: 'ha-pair', name: 'HA pair', step: 2, totalSteps: 8,
  phase: 'Installing 17.1.1 on Node B', phaseStatus: 'running',
  nodes: [
    { id: 'a', name: 'Node A', role: 'active', lifecycle: 'online', version: '16.1.4', volume: 'Volume 1' },
    { id: 'b', name: 'Node B', role: 'standby', lifecycle: 'updating', version: '16.1.4', targetVersion: '17.1.1', progress: 35, volume: 'Volume 2' },
  ],
}

export function createMockDashboard(scenario: string = 'updating'): HaDashboard {
  if (!mockScenarios.includes(scenario as MockScenario)) {
    throw new Error(`Unknown mock scenario: ${scenario}`)
  }
  const pair = structuredClone(basePair)
  const dashboard: HaDashboard = {
    title: 'HA pair', updatedAt: '2026-11-06T23:36:40Z', live: true, layout: 'pair', pairs: [pair],
  }
  switch (scenario) {
    case 'no-volume':
      pair.nodes.forEach((node) => { delete node.volume })
      break
    case 'rebooting':
      pair.step = 3
      pair.phase = 'Node B restarting on 17.1.1'
      pair.nodes[1].lifecycle = 'rebooting'
      break
    case 'traffic-b':
      pair.step = 5
      pair.phase = 'Traffic moved to Node B'
      pair.nodes[0].role = 'standby'
      Object.assign(pair.nodes[1], { role: 'active', lifecycle: 'online', version: '17.1.1' })
      break
    case 'offline':
      pair.step = 3
      pair.phase = 'Node B is offline'
      pair.phaseStatus = 'failed'
      Object.assign(pair.nodes[1], { lifecycle: 'offline', message: 'Not back after restart' })
      break
    case 'clusters':
      dashboard.title = 'HA clusters'
      dashboard.layout = 'clusters'
      dashboard.pairs = [40, 48, 30].map((progress, index) => {
        const cluster = structuredClone(basePair)
        cluster.id = `firewall-${index + 1}`
        cluster.name = `FG-PROD-FW-0${index + 1}`
        cluster.phase = `Node B installing · ${progress}%`
        cluster.nodes[0].version = '7.0.9'
        Object.assign(cluster.nodes[1], { version: '7.0.9', targetVersion: '7.0.12', progress })
        return cluster
      })
      break
  }
  return dashboard
}