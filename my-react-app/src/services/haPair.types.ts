import { z } from 'zod'

export const nodeSchema = z.object({
  id: z.enum(['a', 'b']),
  name: z.string().min(1),
  role: z.enum(['active', 'standby']),
  lifecycle: z.enum(['online', 'updating', 'rebooting', 'offline']),
  version: z.string().min(1),
  targetVersion: z.string().optional(),
  volume: z.string().nullish(),
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
}).superRefine((node, context) => {
  if (node.lifecycle === 'updating' && (node.progress === undefined || !node.targetVersion)) {
    context.addIssue({ code: 'custom', message: 'Updating nodes require progress and targetVersion' })
  }
})

export const pairSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  step: z.number().int().min(1),
  totalSteps: z.number().int().min(1).max(32),
  phase: z.string().min(1),
  phaseStatus: z.enum(['running', 'failed', 'complete']),
  nodes: z.tuple([nodeSchema, nodeSchema]),
}).superRefine((pair, context) => {
  if (pair.step > pair.totalSteps || pair.nodes[0].id !== 'a' || pair.nodes[1].id !== 'b') {
    context.addIssue({ code: 'custom', message: 'Invalid step or node order; expected nodes a, b' })
  }
  if (pair.nodes.filter((node) => node.role === 'active').length > 1) {
    context.addIssue({ code: 'custom', message: 'A pair may have at most one active node' })
  }
})

export const dashboardSchema = z.object({
  title: z.string().min(1),
  updatedAt: z.iso.datetime(),
  live: z.boolean(),
  layout: z.enum(['pair', 'clusters']),
  pairs: z.array(pairSchema),
}).superRefine((dashboard, context) => {
  const ids = dashboard.pairs.map((pair) => pair.id)
  if (new Set(ids).size !== ids.length || (dashboard.layout === 'pair' && ids.length > 1)) {
    context.addIssue({ code: 'custom', message: 'Pair IDs must be unique; pair layout supports one pair' })
  }
})

export type HaNode = z.infer<typeof nodeSchema>
export type HaPair = z.infer<typeof pairSchema>
export type HaDashboard = z.infer<typeof dashboardSchema>

export function getTrafficNode(pair: HaPair): HaNode | undefined {
  return pair.nodes.find((node) => node.role === 'active' && node.lifecycle === 'online')
}