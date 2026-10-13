// The group's `options.targets` (owned by the wiki, see docs/CMS.md): parsing and labels, shared by the
// editor, the summary/detail chip, the list filter and the validator mirror. Pure (no JSX / CSS).
// Mirrors parseTargets() of wiki-cms/src/types/lah-team-formation/validate.ts.

import { SITE } from './roster.ts'
import type { Lang, LocalizedName, Target } from './types.ts'

export const TARGET_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
const LANGS: readonly Lang[] = ['en', 'zh-Hans', 'zh-Hant', 'ja']

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const warned = new Set<string>()
function defaultWarn(message: string): void {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`[lah-team-formation] ${message}`)
}

/**
 * Valid entries of `options.targets`, in registry order. Malformed entries (not an object, bad or
 * duplicate id, no usable label) are ignored with a warning; a bad `url` only drops the link.
 */
export function parseTargets(options: Record<string, unknown> | undefined, warn: (message: string) => void = defaultWarn): Target[] {
  const raw = options?.targets
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) {
    warn('options.targets is not a list; ignored')
    return []
  }
  const out: Target[] = []
  const seen = new Set<string>()
  raw.forEach((e: unknown, i) => {
    if (!isObj(e)) return warn(`options.targets[${i}] is not an object; ignored`)
    const id = e.id
    if (typeof id !== 'string' || !TARGET_ID_RE.test(id)) return warn(`options.targets[${i}].id is not a valid id; ignored`)
    if (seen.has(id)) return warn(`options.targets[${i}]: duplicate id ${id}; ignored`)
    const label: LocalizedName = {}
    if (isObj(e.label)) {
      for (const lang of LANGS) {
        const v = e.label[lang]
        if (typeof v === 'string' && v.trim()) label[lang] = v.trim()
      }
    }
    if (!Object.keys(label).length) return warn(`options.targets[${i}] (${id}) has no label; ignored`)
    seen.add(id)
    const target: Target = { id, label }
    if (typeof e.url === 'string' && safeUrl(e.url)) target.url = e.url
    if (e.retired === true) target.retired = true
    out.push(target)
  })
  return out
}

/** A site path ("/guide/x/") or an https URL; anything else (javascript:, //host, relative) is not linked. */
const safeUrl = (u: string): boolean => (u.startsWith('/') && !u.startsWith('//')) || u.startsWith('https://')

/** Absolute href of the chip (paths are resolved against the wiki, so it also works on the admin origin); '' = no link. */
export function targetHref(target: Pick<Target, 'url'>): string {
  const u = target.url
  if (!u || !safeUrl(u)) return ''
  return u.startsWith('/') ? `${SITE}${u}` : u
}

/** Label in `lang`, falling back to en, then ja, then any language present, then the id. */
export function targetLabel(target: Pick<Target, 'id' | 'label'>, lang: Lang): string {
  const l = target.label ?? {}
  return l[lang] || l.en || l.ja || Object.values(l).find(Boolean) || target.id
}

export const findTarget = (targets: Target[], id: string): Target | undefined => targets.find((t) => t.id === id)

/**
 * What the editor's select offers: the non-retired entries, plus the current value even if it is retired
 * (an admin edit must not lose it) or no longer listed (shown by its raw id, so the validator's
 * `target_unknown` has something to point at).
 */
export function targetChoices(targets: Target[], current: string | null): Target[] {
  const out = targets.filter((t) => !t.retired || t.id === current)
  if (current && !targets.some((t) => t.id === current)) out.push({ id: current, label: {} })
  return out
}
