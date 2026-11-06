import { useEffect, useState } from 'react'
import { fetchHaDashboard } from '../services/haPair.service'
import type { HaDashboard } from '../services/haPair.types'

const config = {
  useMocks: import.meta.env.VITE_USE_MOCKS === undefined
    ? import.meta.env.DEV
    : import.meta.env.VITE_USE_MOCKS === 'true',
  apiUrl: import.meta.env.VITE_HA_API_URL || '/api/ha-pairs',
  mockScenario: import.meta.env.VITE_MOCK_SCENARIO || 'updating',
}

export function useHaDashboard() {
  const [data, setData] = useState<HaDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    async function load() {
      try {
        const response = await fetchHaDashboard(config, controller.signal)
        if (!controller.signal.aborted) {
          setData(response)
          setError(null)
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Unable to load HA status')
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, 10_000)
      }
    }
    void load()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [requestId])

  function retry() {
    setError(null)
    setRequestId((previous) => previous + 1)
  }

  return { data, error, retry }
}