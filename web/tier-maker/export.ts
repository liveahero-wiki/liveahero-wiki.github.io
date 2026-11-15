// Renders a tier list to a PNG on a canvas (instead of screenshotting the DOM, so the image looks the same on every
// device and theme) and embeds the tier list JSON in it. The icons come from the wiki's CDN, which sends CORS headers;
// without them toBlob would throw a SecurityError, which the caller reports.

import { heroIconUrl, sidekickIconUrl, SITE } from '../cms-plugin/roster.ts'
import type { Candidate } from './candidates.ts'
import type { TierList } from './model.ts'
import { embedTierList } from './pngMeta.ts'

const WIDTH = 1200
const ICON = 88
const GAP = 4
const PAD = 6
const LABEL_W = 150
const TITLE_H = 76
const FOOTER_H = 30
const LABEL_FONT = 34
const LABEL_MIN_FONT = 14
const DIVIDER = '#555'
const MIN_ROW_H = ICON + 2 * PAD
const IMAGE_TIMEOUT_MS = 15_000
const IMAGE_CONCURRENCY = 24
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", "Noto Sans SC", sans-serif'

export const iconUrl = (c: Pick<Candidate, 'kind' | 'resourceName'>): string => (c.kind === 'hero' ? heroIconUrl(c.resourceName) : sidekickIconUrl(c.resourceName))

/** Resolves null on an error or after IMAGE_TIMEOUT_MS, so one stalled request cannot hang the export. */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = ''
      resolve(null)
    }, IMAGE_TIMEOUT_MS)
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }
    img.src = url
  })
}

/** Runs `fn` over `items` with at most IMAGE_CONCURRENCY in flight. */
async function eachLimited<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  const worker = async () => {
    while (next < items.length) await fn(items[next++])
  }
  await Promise.all(Array.from({ length: Math.min(IMAGE_CONCURRENCY, items.length) }, worker))
}

/** Black or white, whichever reads better on `hex`. */
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
  return lum > 150 ? '#111' : '#fff'
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight: string): string {
  for (let s = size; s >= 12; s--) {
    ctx.font = `${weight} ${s}px ${FONT}`
    if (ctx.measureText(text).width <= maxW) return text
  }
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
  return `${t}…`
}

/** Greedy word wrap; a word wider than `maxW` (or text without spaces, e.g. CJK) is broken between characters. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const joined = line ? `${line} ${word}` : word
    if (ctx.measureText(joined).width <= maxW) {
      line = joined
      continue
    }
    if (line) lines.push(line)
    line = ''
    for (const ch of word) {
      if (line && ctx.measureText(line + ch).width > maxW) {
        lines.push(line)
        line = ''
      }
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Wraps a tier name over as many lines as fit in `maxH`, shrinking the font to LABEL_MIN_FONT before truncating with an ellipsis. Leaves ctx.font set for drawing. */
function fitLabel(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxH: number): { lines: string[]; lineH: number } {
  let lines: string[] = []
  let lineH = 0
  for (let s = LABEL_FONT; s >= LABEL_MIN_FONT; s--) {
    ctx.font = `bold ${s}px ${FONT}`
    lineH = Math.round(s * 1.15)
    lines = wrapText(ctx, text, maxW)
    if (lines.length * lineH <= maxH) return { lines, lineH }
  }
  lines = lines.slice(0, Math.max(1, Math.floor(maxH / lineH)))
  let last = lines[lines.length - 1]
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
  lines[lines.length - 1] = `${last}…`
  return { lines, lineH }
}

export interface Exported {
  blob: Blob
  /** Icons that failed to load (drawn as placeholders). */
  failed: number
}

export async function exportPng(list: TierList, byKey: ReadonlyMap<string, Candidate>): Promise<Exported> {
  const images = new Map<string, HTMLImageElement | null>()
  const keys = [...new Set(list.tiers.flatMap((t) => t.items))].filter((k) => byKey.has(k))
  await eachLimited(keys, async (k) => void images.set(k, await loadImage(iconUrl(byKey.get(k)!))))

  const cols = Math.max(1, Math.floor((WIDTH - LABEL_W - PAD) / (ICON + GAP)))
  const rowHeights = list.tiers.map((t) => Math.max(MIN_ROW_H, Math.ceil(t.items.length / cols) * (ICON + GAP) - GAP + 2 * PAD))
  const head = list.title.trim() ? TITLE_H : 12
  const height = head + rowHeights.reduce((a, b) => a + b, 0) + FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  ctx.fillStyle = '#1a1a1d'
  ctx.fillRect(0, 0, WIDTH, height)
  ctx.textBaseline = 'middle'

  if (list.title.trim()) {
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(fitText(ctx, list.title.trim(), WIDTH - 2 * PAD - 24, 40, 'bold'), WIDTH / 2, TITLE_H / 2 + 4)
  }

  let failed = 0
  let y = head
  list.tiers.forEach((tier, i) => {
    const h = rowHeights[i]
    ctx.fillStyle = tier.color
    ctx.fillRect(0, y, LABEL_W, h)
    ctx.fillStyle = '#2a2a2e'
    ctx.fillRect(LABEL_W, y, WIDTH - LABEL_W, h)
    ctx.fillStyle = textOn(tier.color)
    ctx.textAlign = 'center'
    const { lines, lineH } = fitLabel(ctx, tier.name, LABEL_W - 20, h - 2 * PAD)
    const top = y + h / 2 - (lines.length * lineH) / 2 + lineH / 2
    lines.forEach((line, n) => ctx.fillText(line, LABEL_W / 2, top + n * lineH))

    tier.items.filter((k) => byKey.has(k)).forEach((k, n) => {
      const c = byKey.get(k)!
      const x = LABEL_W + PAD + (n % cols) * (ICON + GAP)
      const iy = y + PAD + Math.floor(n / cols) * (ICON + GAP)
      const img = images.get(k)
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(x, iy, ICON, ICON, 8)
      ctx.clip()
      if (img) ctx.drawImage(img, x, iy, ICON, ICON)
      else {
        failed++
        ctx.fillStyle = '#444'
        ctx.fillRect(x, iy, ICON, ICON)
        ctx.fillStyle = '#bbb'
        ctx.textAlign = 'center'
        ctx.font = `12px ${FONT}`
        ctx.fillText(String(c.stockId), x + ICON / 2, iy + ICON / 2)
      }
      ctx.restore()
      if (c.kind === 'sidekick') {
        ctx.fillStyle = 'rgba(0,0,0,.7)'
        ctx.beginPath()
        ctx.roundRect(x + ICON - 24, iy + ICON - 18, 24, 18, [6, 0, 8, 0])
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = `bold 11px ${FONT}`
        ctx.fillText('SK', x + ICON - 12, iy + ICON - 8)
      }
    })
    y += h
  })

  // thin grey line between tiers
  ctx.fillStyle = DIVIDER
  let sepY = head
  for (const h of rowHeights.slice(0, -1)) {
    sepY += h
    ctx.fillRect(0, sepY - 1, WIDTH, 2)
  }

  ctx.fillStyle = '#8a8a90'
  ctx.textAlign = 'right'
  ctx.font = `13px ${FONT}`
  ctx.fillText(`${SITE.replace('https://', '')}/tier_maker/`, WIDTH - 10, height - FOOTER_H / 2)

  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!png) throw new Error('could not encode the image')
  const bytes = embedTierList(new Uint8Array(await png.arrayBuffer()), JSON.stringify(list))
  return { blob: new Blob([bytes as BlobPart], { type: 'image/png' }), failed }
}

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const fileName = (title: string): string => `${title.trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(0, 60) || 'tier-list'}.png`
