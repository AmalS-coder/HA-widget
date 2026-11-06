import { HaWidget } from './components/HaWidget'
import { useHaDashboard } from './hooks/useHaDashboard'
import './App.css'

export default function App() {
  const { data, error, retry } = useHaDashboard()

  return (
    <main className="app-shell">
      {error ? (
        <section className="ha-card request-state" role="alert">
          <h1>Unable to load HA status</h1>
          <p>{error}</p>
          <button type="button" onClick={retry}>Retry</button>
        </section>
      ) : data ? (
        <HaWidget data={data} />
      ) : (
        <section className="ha-card request-state" role="status">Loading HA status...</section>
      )}
    </main>
  )
}