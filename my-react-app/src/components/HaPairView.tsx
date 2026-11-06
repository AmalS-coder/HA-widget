import { getTrafficNode } from '../services/haPair.types'
import type { HaNode, HaPair } from '../services/haPair.types'
import { getDeviceAssets, lifecycleLabels } from './haAssets'
import standbyLinkB from '../assets/ha-pair/standby-link.svg'
import standbyLinkA from '../assets/ha-pair/standby-link-a.svg'
import trafficLinkA from '../assets/ha-pair/traffic-link.svg'
import trafficLinkB from '../assets/ha-pair/traffic-link-b.svg'
import clusterStandbyLink from '../assets/ha-pair/cluster-standby-link.svg'
import clusterTrafficLink from '../assets/ha-pair/cluster-traffic-link.svg'
import statusActive from '../assets/ha-pair/status-active.svg'
import statusStandby from '../assets/ha-pair/status-standby.svg'

export function StepProgress({ pair }: { pair: HaPair }) {
  return (
    <div className="phase__steps" style={{ gridTemplateColumns: `repeat(${pair.totalSteps}, minmax(0, 1fr))` }} aria-label={`Step ${pair.step} of ${pair.totalSteps}`}>
      {Array.from({ length: pair.totalSteps }, (_, index) => {
        const state = index < pair.step - 1 || pair.phaseStatus === 'complete'
          ? 'complete'
          : index === pair.step - 1 ? (pair.phaseStatus === 'failed' ? 'failed' : 'current') : ''
        return <span className={`phase__step ${state}`} key={index} />
      })}
    </div>
  )
}

function NodeView({ node }: { node: HaNode }) {
  const assets = getDeviceAssets(node)
  const versionText = node.message || (node.lifecycle === 'updating'
    ? `Installing ${node.targetVersion}`
    : node.lifecycle === 'rebooting'
      ? `Restarting on ${node.targetVersion || node.version}`
      : `Running ${node.version}`)

  return (
    <>
      <div className={`device device--${node.id}${assets.floor ? ' device--floor' : ''}`} aria-hidden="true">
        <img className="device__drawing" src={assets.drawing} alt="" />
        <img className="device__layers" src={assets.layers} alt="" />
      </div>
      <div className={`node-details node-details--${node.id}`}>
        <div className="node-details__heading">
          <span className="node-name">{node.name}</span>
          <span className={`role-badge role-badge--${node.role}`}>
            <img src={node.role === 'active' ? statusActive : statusStandby} alt="" />
            {node.role === 'active' ? 'Active' : 'Standby'}
          </span>
        </div>
        <p className={`node-status node-status--${node.lifecycle}`}>
          {lifecycleLabels[node.lifecycle]}{node.lifecycle === 'updating' ? ` · ${node.progress}%` : ''}
        </p>
        {node.lifecycle === 'updating' && (
          <div className="update-progress" role="progressbar" aria-label={`${node.name} update progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={node.progress}>
            <span style={{ width: `${node.progress}%` }} />
          </div>
        )}
        <p>{versionText}</p>
        {node.volume && <p className="node-volume">{node.volume}</p>}
      </div>
    </>
  )
}

export function PairDiagram({ pair, compact = false }: { pair: HaPair; compact?: boolean }) {
  const trafficNode = getTrafficNode(pair)
  const trafficB = trafficNode?.id === 'b'
  return (
    <section className={`pair-diagram${compact ? ' pair-diagram--compact' : ''}`} aria-label={`${pair.name}; ${trafficNode ? `traffic routed to ${trafficNode.name}` : 'no available active node'}`}>
      <span className="traffic-label">Traffic</span>
      {(!trafficNode || trafficB) && <img className="pair-link pair-link--standby-a" src={standbyLinkA} alt="" />}
      {(!trafficNode || !trafficB) && <img className="pair-link pair-link--standby-b" src={compact ? clusterStandbyLink : standbyLinkB} alt="" />}
      {trafficNode && <img className={`pair-link pair-link--traffic-${trafficNode.id}`} src={trafficB ? trafficLinkB : compact ? clusterTrafficLink : trafficLinkA} alt="" />}
      {pair.nodes.map((node) => <NodeView key={node.id} node={node} />)}
    </section>
  )
}

export function HaPairView({ pair }: { pair: HaPair }) {
  return (
    <>
      <section className="phase" aria-label="Installation progress">
        <p>Step {pair.step} of {pair.totalSteps} · {pair.phase}</p>
        <StepProgress pair={pair} />
      </section>
      <PairDiagram pair={pair} />
    </>
  )
}