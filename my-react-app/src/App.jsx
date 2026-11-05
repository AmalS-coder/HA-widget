import { useState } from 'react'
import './App.css'

import collapseIcon from './assets/ha-pair/collapse.svg'
import legendOffline from './assets/ha-pair/legend-offline.png'
import legendOnline from './assets/ha-pair/legend-online.svg'
import legendRebooting from './assets/ha-pair/legend-rebooting.svg'
import legendUpdating from './assets/ha-pair/legend-updating.svg'
import nodeADrawing from './assets/ha-pair/node-a-drawing.svg'
import nodeALayers from './assets/ha-pair/node-a-layers.svg'
import nodeBDrawing from './assets/ha-pair/node-b-drawing.svg'
import nodeBLayers from './assets/ha-pair/node-b-layers.svg'
import standbyLink from './assets/ha-pair/standby-link.svg'
import statusActive from './assets/ha-pair/status-active.svg'
import statusStandby from './assets/ha-pair/status-standby.svg'
import trafficLink from './assets/ha-pair/traffic-link.svg'

const steps = ['complete', 'current', '', '', '', '', '', '']

function RoleBadge({ status, label }) {
  return (
    <span className={`role-badge role-badge--${status}`}>
      <img src={status === 'active' ? statusActive : statusStandby} alt="" />
      {label}
    </span>
  )
}

function DeviceIllustration({ node, drawing, layers }) {
  return (
    <div className={`device device--${node}`} aria-hidden="true">
      <img className="device__drawing" src={drawing} alt="" />
      <img className="device__layers" src={layers} alt="" />
    </div>
  )
}

function LegendItem({ image, label, variant = '' }) {
  return (
    <span className="legend-item">
      <img className={`legend-item__dot ${variant}`} src={image} alt="" />
      {label}
    </span>
  )
}

function App() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <main className="app-shell">
      <article className="ha-card" aria-label="HA pair status">
        <header className="ha-card__header">
          <div className="ha-card__title-group">
            <h1>HA pair</h1>
            <p>Live · updated 23:36:40</p>
          </div>
          <button
            aria-label={isExpanded ? 'Collapse HA pair' : 'Expand HA pair'}
            aria-expanded={isExpanded}
            className={`collapse-button${isExpanded ? ' is-expanded' : ''}`}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            type="button"
          >
            <img src={collapseIcon} alt="" />
          </button>
        </header>

        {isExpanded && (
          <div className="ha-card__body">
            <section className="phase" aria-label="Installation progress">
              <p>Step 2 of 8 · Installing 17.1.1 on Node B</p>
              <div className="phase__steps" aria-hidden="true">
                {steps.map((step, index) => (
                  <span className={`phase__step ${step}`} key={index} />
                ))}
              </div>
            </section>

            <section
              className="pair-diagram"
              aria-label="Node A active, Node B standby and updating"
            >
              <span className="traffic-label">Traffic</span>
              <img className="pair-diagram__standby-link" src={standbyLink} alt="" />
              <img className="pair-diagram__traffic-link" src={trafficLink} alt="" />

              <DeviceIllustration
                node="a"
                drawing={nodeADrawing}
                layers={nodeALayers}
              />
              <DeviceIllustration
                node="b"
                drawing={nodeBDrawing}
                layers={nodeBLayers}
              />

              <div className="node-details node-details--a">
                <div className="node-details__heading">
                  <span className="node-name">Node A</span>
                  <RoleBadge status="active" label="Active" />
                </div>
                <p className="node-status node-status--online">Online</p>
                <p>Running 16.1.4</p>
                <p className="node-volume">Volume 1</p>
              </div>

              <div className="node-details node-details--b">
                <div className="node-details__heading">
                  <span className="node-name">Node B</span>
                  <RoleBadge status="standby" label="Standby" />
                </div>
                <p className="node-status node-status--updating">Updating · 35%</p>
                <div
                  className="update-progress"
                  role="progressbar"
                  aria-label="Node B update progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="35"
                >
                  <span />
                </div>
                <p>Installing 17.1.1</p>
                <p className="node-volume">Volume 2</p>
              </div>
            </section>

            <footer className="status-legend" aria-label="Node status legend">
              <LegendItem image={legendOnline} label="Online" />
              <LegendItem image={legendUpdating} label="Updating" />
              <LegendItem
                image={legendRebooting}
                label="Rebooting"
                variant="legend-item__dot--outlined"
              />
              <LegendItem image={legendOffline} label="Offline" variant="legend-item__dot--offline" />
            </footer>
          </div>
        )}
      </article>
    </main>
  )
}

export default App
