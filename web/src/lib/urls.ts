// Builders for the absolute CDN / wiki URLs used by the result table.
// The live wiki is served at the domain root (no baseurl), and images live on
// the same CDN regardless of where this app runs, so we hardcode the origin.

import type { Entity } from '../types'

export const SITE = 'https://liveahero-wiki.github.io'
const SPRITE = `${SITE}/cdn/Sprite`

export function statusIcon(icon: string): string {
  // Generator already falls back to 'b_skill_special', but guard anyway.
  return `${SPRITE}/${icon || 'b_skill_special'}.png`
}

export function portrait(entity: Entity): string {
  const suffix = entity.kind === 'hero' ? 'h01' : 's01'
  return `${SPRITE}/icon_${entity.resourceName}_${suffix}.png`
}

export function charaLink(entity: Entity): string {
  const frag = entity.kind === 'hero' ? 'h' : 's'
  // The generator resolves the real chara permalink (page); fall back to the
  // resourceName guess for older indexes that predate that field.
  const path = entity.page || `/charas/${entity.resourceName}/`
  return `${SITE}${path}#${frag}${entity.stockId}`
}
