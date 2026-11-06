import onlineDrawing from '../assets/ha-pair/node-a-drawing.svg'
import onlineLayers from '../assets/ha-pair/node-a-layers.svg'
import updatingDrawing from '../assets/ha-pair/node-b-drawing.svg'
import updatingLayers from '../assets/ha-pair/node-b-layers.svg'
import standbyDrawing from '../assets/ha-pair/standby-online-drawing.svg'
import standbyLayers from '../assets/ha-pair/standby-online-layers.svg'
import rebootingDrawing from '../assets/ha-pair/rebooting-drawing.svg'
import rebootingLayers from '../assets/ha-pair/rebooting-layers.svg'
import offlineDrawing from '../assets/ha-pair/offline-drawing.svg'
import offlineLayers from '../assets/ha-pair/offline-layers.svg'
import activeUpdatingDrawing from '../assets/ha-pair/active-updating-drawing.svg'
import activeUpdatingLayers from '../assets/ha-pair/active-updating-layers.svg'
import activeRebootingDrawing from '../assets/ha-pair/active-rebooting-drawing.svg'
import activeRebootingLayers from '../assets/ha-pair/active-rebooting-layers.svg'
import activeOfflineDrawing from '../assets/ha-pair/active-offline-drawing.svg'
import activeOfflineLayers from '../assets/ha-pair/active-offline-layers.svg'
import online from '../assets/ha-pair/legend-online.svg'
import updating from '../assets/ha-pair/legend-updating.svg'
import rebooting from '../assets/ha-pair/legend-rebooting.svg'
import offline from '../assets/ha-pair/legend-offline.png'
import type { HaNode } from '../services/haPair.types'

export const lifecycleLabels = { online: 'Online', updating: 'Updating', rebooting: 'Rebooting', offline: 'Offline' }
export const statusAssets = { online, updating, rebooting, offline }

const deviceAssets = {
  active: {
    online: { drawing: onlineDrawing, layers: onlineLayers },
    updating: { drawing: activeUpdatingDrawing, layers: activeUpdatingLayers },
    rebooting: { drawing: activeRebootingDrawing, layers: activeRebootingLayers },
    offline: { drawing: activeOfflineDrawing, layers: activeOfflineLayers },
  },
  standby: {
    online: { drawing: standbyDrawing, layers: standbyLayers },
    updating: { drawing: updatingDrawing, layers: updatingLayers },
    rebooting: { drawing: rebootingDrawing, layers: rebootingLayers },
    offline: { drawing: offlineDrawing, layers: offlineLayers },
  },
}

export function getDeviceAssets(node: HaNode) {
  return { ...deviceAssets[node.role][node.lifecycle], floor: node.role === 'active' }
}