import { dashboardSchema } from './haPair.types.ts'
import type { HaDashboard } from './haPair.types.ts'
import { createMockDashboard } from './haPair.mock.ts'

export interface HaServiceConfig {
  useMocks: boolean
  apiUrl: string
  mockScenario: string
}

export async function fetchHaDashboard(
  config: HaServiceConfig,
  signal?: AbortSignal,
): Promise<HaDashboard> {
  signal?.throwIfAborted()
  if (config.useMocks) {
    return dashboardSchema.parse(createMockDashboard(config.mockScenario))
  }
  const response = await fetch(config.apiUrl, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Unable to load HA status (HTTP ${response.status})`)
  }
  return dashboardSchema.parse(await response.json())
}