import { useId, useState } from 'react'
import type { HaDashboard, HaPair } from '../services/haPair.types'
import { HaPairView, PairDiagram, StepProgress } from './HaPairView'
import { lifecycleLabels, statusAssets } from './haAssets'
import collapseIcon from '../assets/ha-pair/collapse.svg'
import compactOnline from '../assets/ha-pair/compact-online.svg'
import compactUpdating from '../assets/ha-pair/compact-updating.svg'

function StatusLegend() {
  return (
    <footer className="status-legend" aria-label="Node status legend">
      {Object.entries(lifecycleLabels).map(([state, label]) => (
        <span className="legend-item" key={state}>
          <img className="legend-item__dot" src={statusAssets[state as keyof typeof statusAssets]} alt="" />{label}
        </span>
      ))}
    </footer>
  )
}

function ClusterItem({ pair, initiallyExpanded }: { pair: HaPair; initiallyExpanded: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const bodyId = useId()
  return (
    <section className="cluster-item">
      <button type="button" className={`cluster-header${expanded ? ' is-expanded' : ''}`} aria-expanded={expanded} aria-controls={bodyId} onClick={() => setExpanded((previous) => !previous)}>
        <img className="cluster-chevron" src={collapseIcon} alt="" />
        <span className="cluster-header__text">
          <strong>{pair.name}</strong>
          <span>Step {pair.step} of {pair.totalSteps} · {pair.phase}</span>
        </span>
        {!expanded && <span className="compact-statuses">
          {pair.nodes.map((node) => (
            <span key={node.id} aria-label={`${node.name} ${lifecycleLabels[node.lifecycle]}`}>
              {node.id.toUpperCase()}
              <img src={node.lifecycle === 'online' ? compactOnline : node.lifecycle === 'updating' ? compactUpdating : statusAssets[node.lifecycle]} alt="" />
            </span>
          ))}
        </span>}
      </button>
      <div id={bodyId} hidden={!expanded} className="cluster-body">
        <div className="cluster-step"><StepProgress pair={pair} /></div>
        <PairDiagram pair={pair} compact />
      </div>
    </section>
  )
}

export function HaWidget({ data }: { data: HaDashboard }) {
  const [expanded, setExpanded] = useState(true)
  const bodyId = useId()
  const title = data.layout === 'clusters' ? `${data.title} · ${data.pairs.length}` : data.title
  const updatedTime = new Date(data.updatedAt).toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false })

  return (
    <article className="ha-card" aria-label={`${data.title} status`}>
      <header className="ha-card__header">
        <div className="ha-card__title-group">
          <h1>{title}</h1>
          <p>{data.live ? 'Live' : 'Paused'} · updated <time dateTime={data.updatedAt}>{updatedTime}</time></p>
        </div>
        <button type="button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${data.title}`} title={`${expanded ? 'Collapse' : 'Expand'} ${data.title}`} aria-expanded={expanded} aria-controls={bodyId} className={`collapse-button${expanded ? ' is-expanded' : ''}`} onClick={() => setExpanded((previous) => !previous)}>
          <img src={collapseIcon} alt="" />
        </button>
      </header>
      <div id={bodyId} hidden={!expanded} className="ha-card__body">
        {data.pairs.length === 0 ? <p role="status">No HA pairs available.</p> : data.layout === 'clusters' ? (
          <div className="cluster-list">
            {data.pairs.map((pair, index) => <ClusterItem key={pair.id} pair={pair} initiallyExpanded={index === 0} />)}
          </div>
        ) : data.pairs.map((pair) => <HaPairView key={pair.id} pair={pair} />)}
        <StatusLegend />
      </div>
    </article>
  )
}