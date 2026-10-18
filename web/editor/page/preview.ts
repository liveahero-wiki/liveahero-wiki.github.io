// The page editor's preview: the page body rendered with the SAME kramdown-style markdown-it setup the site build uses
// (wiki_plugins/markdown), after every Liquid token has been swapped for a marker. {% chara_link %}, item.html and
// item-icon.html become real markup through the renderers given (the real pure functions of wiki_plugins/lib fed by
// /api/editor-data.json); every other include and protected token becomes a small labelled chip.
// Pure apart from the markdown instance, so node --test can import it.

import { tokenize } from '../../../wiki_plugins/lib/contrib-guard.js'
import { createMarkdown } from '../../../wiki_plugins/markdown/index.js'

export type ParamValue = string | number

export interface Renderers {
  /** `{% chara_link <input> %}`: the html, or null to show a chip. */
  chara?(input: string): string | null
  /** `{% include item.html … %}` / `item-icon.html`. */
  item?(file: 'item.html' | 'item-icon.html', params: Record<string, ParamValue>): string | null
}

export interface Labels {
  template: string
  include(name: string): string
}

export const defaultLabels: Labels = { template: 'template', include: (name) => `include ${name}` }

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** `key=value` parameters of an include (numbers, quoted strings, bare words; anything else is skipped). */
export function parseIncludeParams(rest: string): Record<string, ParamValue> {
  const params: Record<string, ParamValue> = {}
  const re = /([A-Za-z_][A-Za-z0-9_-]*)=(?:"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?)(?=\s|$)|([A-Za-z_][A-Za-z0-9_-]*)(?=\s|$))/g
  for (const m of rest.matchAll(re)) {
    const [, key, dq, sq, num, word] = m
    params[key!] = num !== undefined ? Number(num) : (dq ?? sq ?? word ?? '')
  }
  return params
}

export interface IncludeCall {
  file: string
  params: Record<string, ParamValue>
}

/** The file and parameters of `{% include file.html a=1 %}`, or null when the text is not an include tag. */
export function parseInclude(tagText: string): IncludeCall | null {
  const inner = tagText.replace(/^\{%-?/, '').replace(/-?%\}$/, '').trim()
  const m = /^include\s+(\S+)([\s\S]*)$/.exec(inner)
  return m ? { file: m[1]!, params: parseIncludeParams(m[2]!) } : null
}

const chip = (label: string, title: string): string => `<span class='contrib-chip' title='${esc(title)}'>[${esc(label)}]</span>`

/** The chip, or the real markup, a token turns into. */
export function renderToken(text: string, type: string, name: string | undefined, r: Renderers, labels: Labels): string {
  if (type === 'raw') {
    const inner = text.replace(/^\{%-?\s*raw\s*-?%\}/, '').replace(/\{%-?\s*endraw\s*-?%\}$/, '')
    return esc(inner)
  }
  if (type === 'tag' && name === 'chara_link') {
    const inner = text.replace(/^\{%-?\s*chara_link\s+/, '').replace(/\s*-?%\}$/, '')
    return r.chara?.(inner) ?? chip(inner.split('|')[0]!, text)
  }
  if (type === 'tag' && name === 'include') {
    const call = parseInclude(text)
    if (call) {
      if ((call.file === 'item.html' || call.file === 'item-icon.html') && r.item) {
        const html = r.item(call.file, call.params)
        if (html !== null) return html
      }
      return chip(labels.include(call.file), text)
    }
  }
  return chip(labels.template, text)
}

export interface PreparedBody {
  /** Markdown with a marker where each token was. */
  source: string
  /** The html each marker stands for. */
  replacements: string[]
}

const marker = (i: number): string => `LAHPREVIEWTOKEN${i}END`
const MARKER_RE = /LAHPREVIEWTOKEN(\d+)END/g

/** Swaps every Liquid token of `body` (kramdown `{: }` attributes stay: the markdown setup handles them) for a marker. */
export function prepareBody(body: string, r: Renderers = {}, labels: Labels = defaultLabels): PreparedBody {
  const tokens = tokenize(body) as Array<{ type: string; text: string; start: number; end: number; name?: string }>
  const replacements: string[] = []
  let source = ''
  let pos = 0
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k]!
    if (tok.type === 'kramdown') continue
    let end = tok.end
    let html: string
    if (tok.type === 'tag' && tok.name === 'comment') {
      // {% comment %} … {% endcomment %} prints nothing
      const close = tokens.findIndex((x, j) => j > k && x.type === 'tag' && x.name === 'endcomment')
      if (close > k) {
        end = tokens[close]!.end
        k = close
      }
      html = ''
    } else {
      html = renderToken(tok.text, tok.type, tok.name, r, labels)
    }
    source += body.slice(pos, tok.start) + marker(replacements.length)
    replacements.push(html)
    pos = end
  }
  return { source: source + body.slice(pos), replacements }
}

let md: ReturnType<typeof createMarkdown> | null = null

/** The page body as html (unsanitized: the editor passes it through `sanitizePreview` before it touches the DOM). */
export function renderPreview(body: string, r: Renderers = {}, labels: Labels = defaultLabels): string {
  md ??= createMarkdown()
  const { source, replacements } = prepareBody(body, r, labels)
  const html = md.render(source) as string
  return html.replace(MARKER_RE, (_m, i: string) => replacements[Number(i)] ?? '')
}
