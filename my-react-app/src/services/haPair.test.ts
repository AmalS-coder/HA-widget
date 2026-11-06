import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMockDashboard, mockScenarios } from './haPair.mock.ts'
import { dashboardSchema, getTrafficNode } from './haPair.types.ts'
import { fetchHaDashboard } from './haPair.service.ts'

test('all requested mock scenarios satisfy the API contract', () => {
  for (const scenario of mockScenarios) dashboardSchema.parse(createMockDashboard(scenario))
  assert.equal(createMockDashboard('clusters').pairs.length, 3)
  assert.ok(createMockDashboard('no-volume').pairs[0].nodes.every((node) => !node.volume))
})

test('traffic follows the online active node, never an unavailable node', () => {
  const pair = createMockDashboard('traffic-b').pairs[0]
  assert.equal(getTrafficNode(pair)?.id, 'b')
  for (const lifecycle of ['updating', 'rebooting', 'offline'] as const) {
    pair.nodes[1].lifecycle = lifecycle
    assert.equal(getTrafficNode(pair), undefined)
  }
  assert.equal(getTrafficNode(createMockDashboard('offline').pairs[0])?.id, 'a')
})

test('mock responses are isolated and honor cancellation', async () => {
  const config = { useMocks: true, apiUrl: '/api/ha-pairs', mockScenario: 'updating' }
  const first = await fetchHaDashboard(config)
  first.pairs[0].nodes[0].role = 'standby'
  assert.equal((await fetchHaDashboard(config)).pairs[0].nodes[0].role, 'active')
  await assert.rejects(fetchHaDashboard(config, AbortSignal.abort()), { name: 'AbortError' })
})

test('real service requests the configured endpoint and validates data', async (context) => {
  const data = createMockDashboard('rebooting')
  context.mock.method(globalThis, 'fetch', async (url: string, options: RequestInit) => {
    assert.equal(url, '/api/status')
    assert.ok(options.signal)
    return Response.json(data)
  })
  assert.deepEqual(await fetchHaDashboard({ useMocks: false, apiUrl: '/api/status', mockScenario: 'offline' }, new AbortController().signal), data)
})

test('real API errors and invalid payloads do not fall back to mocks', async (context) => {
  const config = { useMocks: false, apiUrl: '/api/ha-pairs', mockScenario: 'updating' }
  const fetchMock = context.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }))
  await assert.rejects(fetchHaDashboard(config), /HTTP 503/)
  fetchMock.mock.mockImplementation(async () => Response.json({ pairs: [] }))
  await assert.rejects(fetchHaDashboard(config))
})