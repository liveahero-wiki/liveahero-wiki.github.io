// Text the page editor's toolbar inserts. Pure.

/** `{% chara_link Name %}`; `variant` is '' (the page's default), 'h1' (hero) or 's1' (sidekick). Null when the name cannot be written in the tag. */
export function charaLinkText(name: string, variant: '' | 'h1' | 's1' = ''): string | null {
  const n = name.trim()
  // the same characters the guard refuses inside the tag
  if (!n || /[|<>{}%"`\\\r\n]/.test(n)) return null
  return `{% chara_link ${n}${variant ? `|${variant}` : ''} %}`
}

/** `{% include item.html id=10 %}` or `item-icon.html` for the icon alone. */
export function itemText(id: number, iconOnly = false): string | null {
  if (!Number.isInteger(id) || id < 0) return null
  return `{% include ${iconOnly ? 'item-icon' : 'item'}.html id=${id} %}`
}

/** A collapsible block, with the blank lines kramdown needs around its markdown content. */
export function detailsBlock(summary: string, body: string): string {
  const s = summary.replace(/[<>\r\n]/g, ' ').trim()
  return `<details>\n<summary>${s}</summary>\n\n${body}\n\n</details>\n`
}

export type SectionKind = 'usage' | 'notes' | 'blank'

/** A `##` section heading (page headings stay in English, like the rest of the wiki). */
export function sectionTemplate(kind: SectionKind): string {
  return kind === 'usage' ? '## Usage guide\n\n' : kind === 'notes' ? '## Notes\n\n' : '## \n\n'
}

/** Appends a section at the end of the body, separated by one blank line. Returns the new body and where the cursor goes (after the heading). */
export function appendSection(body: string, kind: SectionKind): { value: string; cursor: number } {
  const trimmed = body.replace(/\s+$/, '')
  const head = trimmed ? `${trimmed}\n\n` : ''
  const section = sectionTemplate(kind)
  const value = head + section
  return { value, cursor: kind === 'blank' ? head.length + 3 : value.length }
}

/** Replaces the selection [start, end) with `text`; the cursor goes after it. */
export function insertText(value: string, start: number, end: number, text: string): { value: string; cursor: number } {
  const s = Math.max(0, Math.min(start, value.length))
  const e = Math.max(s, Math.min(end, value.length))
  return { value: value.slice(0, s) + text + value.slice(e), cursor: s + text.length }
}

/** Case-insensitive substring search, prefix matches first, at most `limit` results. */
export function searchBy<T>(list: readonly T[], query: string, nameOf: (x: T) => string, limit = 8): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const starts: T[] = []
  const contains: T[] = []
  for (const x of list) {
    const n = nameOf(x).toLowerCase()
    if (n.startsWith(q)) starts.push(x)
    else if (n.includes(q)) contains.push(x)
    if (starts.length >= limit) break
  }
  return [...starts, ...contains].slice(0, limit)
}
